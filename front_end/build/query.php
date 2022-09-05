<?php
//1.初始化
error_reporting(0);//禁止向客户端返回错误信息
header('Content-Type:application/json; charset=utf-8');//json数据格式报头
$query = $_GET;//获取查询信息
$response = array();//初始化结果数组
$stopwords_cn = ["的", "地", "得", "和"];//中文停用词（示例）
$stopwords_en = ["a", "an", "the", "to", "of", "on", "in", "with"];//英文停用词（示例）
$list_num_max = 20;

//2.若为有效查询，则开始处理
if (array_key_exists("keyword", $query) && $query["keyword"] != "") {
  //2.1.连接数据库
  $conn = new mysqli("localhost", "root", "mysql123456", "demo");
  if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
  }

  //2.2.分词
  $keywords_en = array();//英文关键词数组
  $keywords_cn = array();//中文关键词数组
  foreach (explode(" ", $query["keyword"]) as $keyword) {//先根据空格初步分词
    if ($keyword == "") {
      continue;
    }
    $is_en = preg_match("/^[^\x80-\xff]+$/", $keyword);
    if ($is_en) {//该词为英文
      $keyword = strtolower($keyword);//统一转化为小写
      $stoped = false;
      foreach ($stopwords_en as $w) {
        if ($w == $keyword) {//英文停用词为一个完整的词，若等于停用词则跳过
          $stoped = true;
          break;
        }
      }
      if (!$stoped) {//否则加入关键词数组
        array_push($keywords_en, $keyword);
      }
    }
    else {//该词为中文或其它（尽力检索）
      $pattern = "/";
      for ($i = 0; $i < count($stopwords_cn); $i++) {
        if ($i == 0) {
          $pattern = $pattern . $stopwords_cn[$i];  
        }
        else {
          $pattern = $pattern . "|" . $stopwords_cn[$i];  
        }
      }
      $pattern = $pattern . "/u";//适用于中文的正则匹配模式
      $ks = preg_split($pattern, $keyword);//中文停用词一般与其他词直接相连，因此正则匹配停用词然后二次分词
      foreach ($ks as $k) {//对二次分词结果进行检索
        if ($k == "") {
          continue;
        }
        else {
          array_push($keywords_cn, $k);
        }
      }
    }
  }

  //2.3.检索
  //2.3.1.先将每个包含单个关键词的前n项取出
  $results = array();
  if (count($keywords_en) > 0) {
    foreach ($keywords_en as $keyword_en) {
      query_en($conn, $keyword_en, $query);
    }
  }
  if (count($keywords_cn) > 0) {
    foreach ($keywords_cn as $keyword_cn) {
      query_cn($conn, $keyword_cn, $query);
    }
  }
  //2.3.2.再对全部关键词的rank排序，取前n项
  arsort($results);
  $results = array_slice($results, 0, $list_num_max);

  //2.4.返回检索结果，断开数据库
  $response = array_values(array_keys($results)); 
  $conn->close();
}

//3.返回处理结果
echo json_encode($response);

//英文数据库检索
function query_en($conn, $keyword, $query){
  global $list_num_max;
  global $results;
  $sql = "SELECT ImageIds,LabelNameEN FROM DaoPai WHERE LabelNameEN REGEXP '^{$keyword}| {$keyword}'";//先在倒排表中检索带有该关键词的全部词项
  $result = $conn->query($sql);
  
  while ($row = mysqli_fetch_array($result)) {
      $imgs = explode("/", $row[0]);
      $cur_num = 0;
      for ($i = 0; $i < count($imgs) - 1; $i++) {//遍历每个词项对应的imageId列表
        if ($cur_num > $list_num_max) {
          break;
        }
        $subsql = "SELECT * FROM ZhengPai WHERE LabelNameEN='{$row[1]}' AND ImageId='{$imgs[$i]}'";//在正排表中检索Image中该词项的具体信息
        $subresult = $conn->query($subsql);
        $subrow = mysqli_fetch_array($subresult);
        if ($subrow && advance_test($subrow, $query)) {//满足条件的Image写入结果列表，同时更新该Image的Rank
          if (array_key_exists($imgs[$i], $results)) {
            $results[$imgs[$i]] += $subrow["BoxScale"] * 2;//不是第一次出现，说明同时包含多个关键词，给予加权奖励
          }
          else {
            $results[$imgs[$i]] = $subrow["BoxScale"];//第一次出现，正常处理
            $cur_num++;
          }
        }
      }
  }
}

//中文数据库检索
function query_cn($conn, $keyword, $query){
  global $list_num_max;
  global $results;
  $sql = "SELECT ImageIds,LabelNameEN FROM DaoPai WHERE LabelNameCN='{$keyword}'";//倒排表可以直接判断相等，其余均与英文检索相同
  $result = $conn->query($sql);
  while ($row = mysqli_fetch_array($result)) {
      $imgs = explode("/", $row[0]);
      $cur_num = 0;
      for ($i = 0; $i < count($imgs) - 1; $i++) {
        if ($cur_num > $list_num_max) {
          break;
        }
        $subsql = "SELECT * FROM ZhengPai WHERE LabelNameEN='{$row[1]}' AND ImageId='{$imgs[$i]}'";
        $subresult = $conn->query($subsql);
        $subrow = mysqli_fetch_array($subresult);
        if ($subrow && advance_test($subrow, $query)) {
          if (array_key_exists($imgs[$i], $results)) {
            $results[$imgs[$i]] += $subrow["BoxScale"] * 2;
          }
          else {
            $results[$imgs[$i]] = $subrow["BoxScale"];
            $cur_num++;
          }
        }
      }
  }
}

//高级检索的条件检验
function advance_test($subrow, $query){
  if (array_key_exists("complete", $query) && $query["complete"] == "true") {//完整=不被遮挡+不被截断
    if ($subrow["IsOccluded"] == "1" || $subrow["IsTruncated"] == "1") {
      return false;
    }
  }
  if (array_key_exists("group", $query) && $query["group"] == "true") {//群组
    if ($subrow["IsGroupOf"] == "0") {
      return false;
    }
  }
  if (array_key_exists("depiction", $query) && $query["depiction"] == "true") {//抽象
    if ($subrow["IsDepiction"] == "0") {
      return false;
    }
  }
  if (array_key_exists("noHorizontal", $query) && $query["noHorizontal"] == "true") {//无横版
    if ($subrow["Size"] == "1") {
      return false;
    }
  }
  if (array_key_exists("noVertical", $query) && $query["noVertical"] == "true") {//无竖版
    if ($subrow["Size"] == "2") {
      return false;
    }
  }
  return true;
}

?>