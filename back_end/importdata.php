<?php
$servername = "localhost";
$username = "root";
$password = "mysql123456";
$dbname = "demo"; 

//创建连接
$conn = new mysqli($servername, $username, $password, $dbname);
 
//检测连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
} 

//导入倒排数据
$sql = "INSERT INTO DaoPai(LabelNameEN, LabelNameCN, ImageIds) VALUES(?, ?, ?)" ;
$stmt = mysqli_stmt_init($conn);

if (mysqli_stmt_prepare($stmt, $sql)) {
    mysqli_stmt_bind_param($stmt, 'sss', $labelNameEN, $labelNameCN, $imageIds);
    $n = 0;
    $file = fopen('demo_daopai.csv', 'r');
    while ($data = fgetcsv($file)) {
        if ($n > 0) {
            $labelNameEN = $data[0];
            $labelNameCN = $data[1];
            $imageIds = $data[2];
            mysqli_stmt_execute($stmt);
        }
    $n++;
}
fclose($file);
}
echo "daopai import success\n";


//导入正排数据
$sql = "INSERT INTO ZhengPai(ImageId, LabelNameEN, LabelNameCN, BoxScale, IsOccluded, IsTruncated, IsGroupOf, IsDepiction, IsInside, Size) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)" ;
$stmt = mysqli_stmt_init($conn);

if (mysqli_stmt_prepare($stmt, $sql)) {
    mysqli_stmt_bind_param($stmt, 'sssdsssssd', $imageId, $labelNameEN, $labelNameCN, $boxScale, $isOccluded, $isTruncated, $isGroupOf, $isDepiction, $isInside, $size);
    $n = 0;
    $file = fopen('demo_zhengpai.csv', 'r');
    while ($data = fgetcsv($file)) {
        if ($n > 0) {
            $imageId = $data[0];
            $labelNameEN = $data[1];
            $labelNameCN = $data[2];
            $boxScale = $data[3];
            $isOccluded = $data[4];
            $isTruncated = $data[5];
            $isGroupOf = $data[6];
            $isDepiction = $data[7];
            $isInside = $data[8];
            $size = $data[9];
            mysqli_stmt_execute($stmt);
        }
    $n++;
}
fclose($file);
}
echo "zhengpai import success\n";


//断开连接
$conn->close();
?>