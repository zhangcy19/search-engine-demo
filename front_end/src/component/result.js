//result.js
//result子组件，负责展示结果列表和进一步高级查询的交互动作
//Created by 张朝阳 on 2022/5/3

import logo from '../logo.svg';
import './result.css';
import axios from 'axios';
import React, { Component } from 'react';

class Result extends Component {
  //组件状态
  state = {
    list: this.props.list,//从父组件直接继承候选词库
    listShow: [],////要展示的候选词的列表
    listNotShow: [],//要取消展示的候选词列表（实现平滑的候选词变化）
    showList: false,//是否展示候选词
    query: this.props.query,//从父组件继承的查询信息
    imgsLoaded: false,//结果是否加载完成
    imgs: []//图片结果列表
  }

  //组件挂载后运行
  componentDidMount = () => {
    document.getElementById("in-r").value = this.props.query.keyword || "";//输入框恢复用户输入
    this.query(); //执行搜索
  }

  //输入改变事件（基本同search.js）
  inputChange = () => {
    var wordInput = document.getElementById("in-r").value;
    var maxNum = 8;
    var query = this.state.query;
    query.keyword = wordInput;
    if (wordInput) {
      var list = this.state.list;
      var count = 0;
      var listShow = [];
      var listNotShow = this.state.listNotShow;
      for (var i = 0; i < list.length; i++) {
        if (count >= maxNum) {
          break;
        }
        if (list[i].indexOf(wordInput) >= 0 || list[i].indexOf(wordInput.toLowerCase()) >= 0) {
          listShow.push(list[i]);
          count++;
        }
      }
      if (listShow.length == 0) {
        listShow.push(wordInput);
        this.setState({
          listShow: listShow,
          listNotShow: [],
          query: query,
          showList: true
        })
      }
      else {
        this.state.listShow.forEach(element => {
          if (!listShow.includes(element)) {
            listNotShow.push(element);
          }
        });
        this.setState({
          listShow: listShow,
          listNotShow: listNotShow,
          query: query,
          showList: true
        })
      }
    }
    else {
      this.setState({
        listShow: [],
        listNotShow: [],
        query: query
      })
    }
  }

  //键盘事件（基本同search.js）
  keydown = (event) => {
    if (event.keyCode == 13 && this.state.query.keyword) {
      this.setState({
        showList:false
      })
      document.getElementById("in-r").blur();//回车后取消输入框焦点
      this.query();//执行查询操作
    }
  }

  //查询操作
  query = () => {
    this.setState({
      imgsLoaded:false//显示加载动画
    })
    axios.get("./query.php", {
      params: this.state.query//具体参数
    })//向服务器发起查询请求
      .then((response) => {
        var res = response.data;
        this.setState({
          imgsLoaded:true,//更新结果列表，取消加载动画
          imgs:res
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  //用户单击候选词列表事件（基本同search.js）
  clickList = (event) => {
    event.stopPropagation();
    var text = event.target.innerText;
    var query = this.state.query;
    query.keyword = text;
    this.setState({
      showList:false,
      query:query
    })
    document.getElementById("in-r").value = text;//更新输入框文本
    document.getElementById("in-r").blur();//取消输入框焦点
    this.query();//执行查询操作
  }

  //用户单击输入框事件（基本同search.js）
  clickInput = (event) => {
    event.stopPropagation();
    this.setState({
      showList: true
    })
  }

  //用户单击高级搜索的开关事件
  clickCheck = (event) => {
    var id = event.target.id;//获取元素的id
    var checked = event.target.checked//获取元素的开关状态
    var query = this.state.query
    switch(id){//更新查询信息
      case "complete":
        query.complete = checked;
        break;
      case "group":
        query.group = checked;
        break;
      case "depiction":
        query.depiction = checked;
        break;
      case "noHorizontal":
        query.noHorizontal = checked;
        break;
      case "noVertical":
        query.noVertical = checked;
        break;
      default:
        query = query
    }
    this.setState({
      query:query
    })
    this.query();//执行查询操作
  }

  //单击logo事件
  clickLogo = () => {
    this.props.callback({//向父组件传递信息，更新状态，回退到search组件
      status:1
    })
  }

  //用户单击其他区域事件（基本同search.js）
  clickNone = () => {
    this.setState({
      showList: false
    })
  }

  //渲染
  render() {
    if (this.state.showList) {//候选词列表元素
      var listShow = this.state.listShow.map((element, index) => <li key={index}><a className="show-r" onClick={this.clickList}>{element}</a></li>)
      var listNotShow = this.state.listNotShow.map((element, index) => <li key={index}><a className="notShow-r">{element}</a></li>)
    }
    else {//无候选词
      var listShow = null;
      var listNotShow = null;
    }
    if (this.state.imgsLoaded) {//图片元素
      var imgs = this.state.imgs.map((element, index) => <a className="img-link" key={index} href={"./train_6_demo/"+element+".jpg"} download={element+".jpg"}><img className="img" src={"./train_6_demo/"+element+".jpg"} alt={"image"}/></a>)
      var append = 
        <div className="end-line"><span>以上为优选检索结果，如对结果不满意<br/>请尝试<b>修改关键词</b>或<b>查询条件</b></span></div>
    }
    else {//加载界面
      var imgs = null
      var append = 
        <div className="loading">
          <div className="loading-ring"></div>
          <p>努力检索中...</p>
        </div> 
    }
    return (
      <div className="result" onClick={this.clickNone}>
        <div className="cover-r">
          <img src={logo} className="logo-r" alt="logo" onClick={this.clickLogo} />
          <div className="totalinput-r">
            <div className="inputbox-r">
              <input id="in-r" className="input-r" onClick={this.clickInput} onChange={this.inputChange} onKeyDown={this.keydown} placeholder="搜索" type="text" autoComplete="off" />
              <ul className="ul-r">{listShow}{listNotShow}</ul>
            </div>
            <div className="advance-r">
              <span className="tooltip">完整
                <span className="tooltiptext">对象完整出现</span>
                <div className="check-r"><input type="checkbox" id="complete" onClick={this.clickCheck} /></div>
              </span>
              <span className="tooltip">群组
                <span className="tooltiptext">对象多次出现</span>
                <div className="check-r"><input type="checkbox" id="group" onClick={this.clickCheck} /></div>
              </span>
              <span className="tooltip">抽象
                <span className="tooltiptext">对象是抽象描绘</span>
                <div className="check-r"><input type="checkbox" id="depiction" onClick={this.clickCheck} /></div>
              </span>
              <span className="vr-r">|</span>
              <span className="tooltip">无横版
                <span className="tooltiptext">不允许横向图片</span>
                <div className="check-r"><input type="checkbox" id="noHorizontal" onClick={this.clickCheck} /></div>
              </span>
              <span className="tooltip">无竖版
                <span className="tooltiptext">不允许竖向图片</span>
                <div className="check-r"><input type="checkbox" id="noVertical" onClick={this.clickCheck} /></div>
              </span>
            </div>
          </div>
        </div>
        <hr className="hr-r" />
        <div className="imgs">{imgs}</div>
        <div className="append">{append}</div>
      </div>
    )
  }
}

export default Result;