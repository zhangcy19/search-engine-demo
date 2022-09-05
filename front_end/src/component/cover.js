//cover.js
//cover子组件，负责展示logo与标题
//Created by 张朝阳 on 2022/5/3

import logo from '../logo.svg';
import './cover.css'
import React, {Component} from 'react';

class Cover extends Component {
  //向父组件传递信息，更新status
  changeStatus = () => {
    this.props.callback({
      status:1
    })
  }

  //渲染
  render(){ 
    return(
      <div className="cover">
        <button className='button-c' onClick={this.changeStatus}>
          <img src={logo} className="logo-c" alt="logo" />
          <p>图片搜索引擎DEMO</p>
        </button>
      </div>
    )
  }
}

export default Cover;