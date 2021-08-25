import React from 'react';
import routes from "./config/routes";
import renderRoutes from "./utils/renderRoutes";
import { HashRouter } from "react-router-dom";
import { defaults, LambdaParam } from '@midwayjs/hooks/request';
import axios from 'axios';
import 'antd/dist/antd.css';
import { navigateTo } from './utils/navigator';
import 'src/render/components/index';
import 'src/utils/Editor';

defaults.request = async (param: LambdaParam) => {
  const token = localStorage.getItem('token');
  const resp = await axios({
    ...param,
    headers: {
      'token': token ?? '',
      'url': param.url
    }
  });

  return resp.data;
}

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      SimpleRoutes: null
    }
  }

  checkLogin() {
    const token = localStorage.getItem('token');
    // 非登录页 检查登录状态
    // eslint-disable-next-line
    if (location.hash.indexOf('login') === -1 && !token) {
      navigateTo('login');
    }
  }

  async componentDidMount() {
    this.checkLogin();
    const res = await renderRoutes(routes);
    window.addEventListener('hashchange', (value: HashChangeEvent) => {
      const { newURL } = value;
      const token = localStorage.getItem('token');
      // 未登录 且想访问非登录页面 跳转回登录页面
      if (newURL.indexOf('login') === -1 && !token) {
        navigateTo('login');
      }
    })

    this.setState({
      SimpleRoutes: res
    })
  }

  render() {
    const { SimpleRoutes } = this.state;

    return (
      <HashRouter>
        {SimpleRoutes}
      </HashRouter>
    );
  }
}

export default App;
