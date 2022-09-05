//App.js
//主组件，负责渲染子组件
//Created by 张朝阳 on 2022/5/3

import './App.css';
import React, {Component} from 'react';
import Cover from './component/cover';
import Search from './component/search';
import Result from './component/result';
import Error from './component/error';

class App extends Component {
  //组件状态
  state = {
    status:0,
    query:{},
    list:[]
  }

  //错误处理
  static getDerivedStateFromError(error) {
    return {status:3}
  }

  //错误捕捉
  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  //回调函数（用于子组件向上传递信息）
  callback = (state) => {
    this.setState(state)
  }

  //渲染
  render() {
    if(this.state.status === 0) {//logo页面
      return (
        <div className="App">
          <Cover callback={this.callback}/>
        </div>
      );
    }
    else if(this.state.status == 1){//主搜索页面
      return (
        <div className="App">
          <Search callback={this.callback}/>
        </div>
      );
    }
    else if(this.state.status == 2){//结果显示页面
      return (
        <div className="App">
          <Result query={this.state.query} list={this.state.list} callback={this.callback}/>
        </div>
      );
    }
    else {//错误提示页面
      return (
        <div className="App">
          <Error/>
        </div>
      )
    }
  }
}

export default App;
