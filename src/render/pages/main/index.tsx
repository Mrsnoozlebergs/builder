import { Layout, Menu, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import './index.less';
import { navigateTo } from 'src/utils/navigator';
import { logout } from 'src/apis/lambda/user';
import { handle500 } from 'src/utils/error';
import PageList from '../pageList';

const { Header, Content } = Layout;

type path = 'user-setting' | 'mode-center' | 'pageList' | '/';
interface IProps {

}

interface IState {
  curPath: path;
}

class Main extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      curPath: 'pageList'
    }
  }

  handleMenuClick = (info: any) => {
    const { key } = info;

    switch(key) {
      case 'logout':
        // 退出登录
        logout().then(res => {
          if (!res.success) {
            message.success('退出登录成功!');
          } else {
            message.error(res.msg);
          }
        }).catch(err => {
          message.error(JSON.stringify(err));
          handle500();
        }).finally(() => {
          // 清除token和userInfo
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          // 跳转到登录页面
          navigateTo('login');
        })
        break;
      case 'user-setting':
        message.info('跳转到用户设置');
        break;
      case 'create':
        navigateTo('create');
        break;
      case 'mode-center':
        message.info('跳转到模块中心');
        break;
      case 'my-page':
        this.setState({
          curPath: 'pageList'
        })
        break;
      default:
        // 跳转到错误页面
        // eslint-disable-next-line
        location.hash = '#/error';
        break;
    }
  }

  renderContent = (curPath: path) => {
    let Component;

    switch (curPath) {
      case '/':
        Component = (
          <div>
            啦啦啦
          </div>
        )
        break;
      case 'mode-center':
        Component = (
          <div>
            还没写
          </div>
        )
        break;
      case 'pageList':
        Component = <PageList />;
        break;
      case 'user-setting':
        Component = <div>123333</div>;
        break;
    }

    return Component;
  }

  render() {
    const { curPath } = this.state;
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    return (
      <Layout className="layout">
        <Header className="header">
          <Menu onClick={this.handleMenuClick} theme="dark" mode="horizontal">
            <Menu.Item key="create">创建</Menu.Item>
            <Menu.Item key="mode-center">模块中心</Menu.Item>
            <Menu.Item key="my-page">我的页面</Menu.Item>
            <Menu.SubMenu key="SubMenu" title={(
              <>
                <Avatar icon={<UserOutlined />} size={32} />
                <span className="user-name">{userInfo?.userName || '测试用户'}</span>
              </>)
            }>
              <Menu.ItemGroup title="设置">
                <Menu.Item key="user-setting">
                  个人中心
                </Menu.Item>
                <Menu.Item key="logout">
                  退出登录
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu.SubMenu>
          </Menu>
          
        </Header>
        <Content>
            {this.renderContent(curPath)}
        </Content>
      </Layout>
    )
  }
}

export default Main;