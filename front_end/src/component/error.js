//error.js
//error子组件，负责展示错误提示信息
//Created by 张朝阳 on 2022/5/26

import error from '../error.svg';
import './error.css'
import React, {Component} from 'react';

class Error extends Component {
  render(){ 
    return(
      <div className="error">
        <button className='button-e' onClick={this.changeStatus}>
          <img src={error} className="logo-e" alt="logo" />
          <p>出错了,请<b>刷新页面</b>或<b>联系管理员</b></p>
        </button>
      </div>
    )
  }
}

export default Error;