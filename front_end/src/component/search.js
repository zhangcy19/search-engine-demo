//search.js
//search子组件，负责用户初次搜索的交互动作
//Created by 张朝阳 on 2022/5/3

import logo from '../logo.svg';
import './search.css';
import axios from 'axios';
import React, { Component } from 'react';

class Search extends Component {
  //组件状态
  state = {
    list: [],//候选词库
    listShow: [],//要展示的候选词的列表
    listNotShow: [],//要取消展示的候选词列表（实现平滑的候选词变化）
    showList: false,//是否展示候选词
    query: {}//查询的信息
  }

  //组件挂载后运行
  componentDidMount = () => {
    axios.get("./list.json")//向服务器请求候选词库文件
      .then((response) => {
        var list = response.data.list;
        this.setState({
          list: list
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  //输入改变事件
  change = () => {
    var wordInput = document.getElementById("in-s").value;
    var maxNum = 8;
    if (wordInput) {//有效输入则尝试匹配输入并给出候选词
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
      if (listShow.length == 0) {//未发现匹配的候选词则把用户已输入的词放入候选词列表
        listShow.push(wordInput);
        this.setState({
          listShow: listShow,
          listNotShow: [],
          query: {
            keyword: wordInput
          },
          showList: true
        })
      }
      else {//发现匹配的词则更新取消展示的候选词列表实现平滑过渡
        this.state.listShow.forEach(element => {
          if (!listShow.includes(element)) {
            listNotShow.push(element);
          }
        });
        this.setState({
          listShow: listShow,
          listNotShow: listNotShow,
          query: {
            keyword: wordInput
          },
          showList: true
        })
      }
    }
    else {//无效输入则清空展示和不展示的候选词列表
      this.setState({
        listShow: [],
        listNotShow: [],
        query: {
          keyword: wordInput
        }
      })
    }
  }

  //键盘事件
  keydown = (event) => {
    if (event.keyCode == 13 && this.state.query.keyword) {//按下回车并且有效输入
      this.props.callback({//向父组件传递查询信息并更新状态
        status: 2,
        query: this.state.query,
        list:this.state.list
      })
    }
  }

  //用户单击候选词列表事件
  clickList = (event) => {
    event.stopPropagation();//阻止向父元素进一步传播单击事件
    var text = event.target.innerText;//获取用户单击的候选词信息
    var query = this.state.query;//更新查询信息
    query.keyword = text;
    this.props.callback({//向父组件传递查询信息并更新状态
      status: 2,
      query: query,
      list:this.state.list
    })
  }

  //用户单击输入框事件
  clickInput = (event) => {
    event.stopPropagation();//阻止向父元素进一步传播单击事件
    this.setState({//展示候选词列表
      showList: true
    })
  }

  //用户单击其他区域事件
  clickNone = () => {
    this.setState({//隐藏候选词列表
      showList: false
    })
  }

  //渲染
  render() {
    if (this.state.showList) {//候选词列表元素
      var listShow = this.state.listShow.map((element, index) => <li key={index}><a className="show-s" onClick={this.clickList}>{element}</a></li>)
      var listNotShow = this.state.listNotShow.map((element, index) => <li key={index}><a className="notShow-s">{element}</a></li>)
    }
    else {//无候选词
      var listShow = null;
      var listNotShow = null;
    }
    return (
      <div className="search" onClick={this.clickNone}>
        <div className="searchbox-s">
          <div className="cover-s">
            <img src={logo} className="logo-s" alt="logo" />
            <p>图片搜索引擎DEMO</p>
          </div>
          <input id="in-s" className="input-s" onClick={this.clickInput} onChange={this.change} onKeyDown={this.keydown} placeholder="搜索" type="text" autoComplete="off" autoFocus="autofocus" />
          <ul className="ul-s">{listShow}{listNotShow}</ul>
        </div>
      </div>
    )
  }
}

export default Search;