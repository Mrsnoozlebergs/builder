import {
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useState, useEffect } from 'react';
import ProForm, { ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';

import './index.less';
import { login, register } from 'src/apis/lambda/user';
import { User } from 'src/apis/entity/user';
import { handle500 } from 'src/utils/error';

export type LoginProps = {
  dispatch: any;
  userLogin: any;
  submitting?: boolean;
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC<LoginProps> = (props) => {
  const { userLogin = {}, submitting } = props;
  const { status, type: loginType } = userLogin;
  const [type, setType] = useState<string>('account');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // eslint-disable-next-line
      location.hash = '#/index';
    }
  }, [])

  const handleSubmit = (values: any) => {
    const { dispatch } = props;
    if (type === 'register') {
      const user = new User();
      const { password, mobile, userName } = values;
      user.user_password = password;
      user.user_phone = mobile;
      user.user_name = userName;

      register(user).then(val => {
        if (val.success === undefined) {
          return message.error('服务器内部错误!');
        }
        if (!val.success) {
          message.success('注册成功!');
        } else {
          message.error(val.msg);
        }
      }).catch(err => {
        message.error(JSON.stringify(err));
        handle500();
      })
    } else {
      login({
        userName: values.userName,
        password: values.password
      }).then(res => {
        if (res.success === undefined) {
          return message.error('服务器内部错误!');
        }
        if (!res.success) {
          message.success('登录成功!');
          localStorage.setItem('token', res.data?.token!);
          localStorage.setItem('userInfo', JSON.stringify(res.data));
          // eslint-disable-next-line
          location.hash = '/index';
        } else {
          message.error(res.msg);
        }
      }).catch(err => {
        message.error(JSON.stringify(err));
        handle500();
      })
      dispatch({
        type: 'login/login',
        payload: { ...values, type },
      });
    }
  };

  return (
    <div className="main">
      <ProForm
        initialValues={{
          autoLogin: true,
        }}
        submitter={{
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={(values) => {
          handleSubmit(values as any);
          return Promise.resolve();
        }}
      >
        <Tabs activeKey={type} onChange={setType}>
          <Tabs.TabPane
            key="account"
            tab={'账号密码登录'}
          />
          <Tabs.TabPane
            key="mobile"
            tab='手机号登录'
          />
          <Tabs.TabPane 
            key="register"
            tab="注册"
          />
        </Tabs>

        {status === 'error' && loginType === 'account' && !submitting && (
          <LoginMessage
            content='账号密码错误'
          />
        )}
        {type === 'account' && (
          <>
            <ProFormText
              name="userName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className='prefixIcon' />,
              }}
              placeholder={'用户名'}
              rules={[
                {
                  required: true,
                  message: ('请输入用户名'),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className='prefixIcon' />,
              }}
              placeholder={'密码'}
              rules={[
                {
                  required: true,
                  message: ('请输入密码!'),
                },
              ]}
            />
          </>
        )}

        {status === 'error' && loginType === 'mobile' && !submitting && (
          <LoginMessage content="验证码错误" />
        )}
        {type === 'mobile' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className='prefixIcon' />,
              }}
              name="mobile"
              placeholder={'手机号'}
              rules={[
                {
                  required: true,
                  message: ('请输入手机号'),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: ('手机号格式错误'),
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className='prefixIcon' />,
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} 获取验证码`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: ('请输入验证码'),
                },
              ]}
              onGetCaptcha={async (mobile) => {
                // const result = await getFakeCaptcha(mobile);
                // if (result === false) {
                //   return;
                // }
                message.success('获取验证码成功！验证码为：1234');
              }}
            />
          </>
        )}

        {status === 'error' && loginType === 'mobile' && !submitting && (
          <LoginMessage content="验证码错误" />
        )}
        {type === 'register' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className='prefixIcon' />,
              }}
              name="mobile"
              placeholder={'手机号'}
              rules={[
                {
                  required: true,
                  message: ('请输入手机号'),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: ('手机号格式错误'),
                },
              ]}
            />
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <MobileOutlined className='prefixIcon' />,
              }}
              name="userName"
              placeholder={'用户名'}
              rules={[
                {
                  required: true,
                  message: ('请输入用户名'),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className='prefixIcon' />,
              }}
              placeholder={'密码'}
              rules={[
                {
                  required: true,
                  message: ('请输入密码!'),
                },
              ]}
            />
            <ProFormText.Password
              name="passwordRepeat"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className='prefixIcon' />,
              }}
              placeholder={'确认密码'}
              rules={[
                {
                  required: true,
                  message: ('请输入密码确认!'),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('两次密码不相同!');
                  },
                }),
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: <MailOutlined className='prefixIcon' />,
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} 获取验证码`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: ('请输入验证码'),
                },
              ]}
              onGetCaptcha={async (mobile) => {
                // const result = await getFakeCaptcha(mobile);
                // if (result === false) {
                //   return;
                // }
                message.success('获取验证码成功！验证码为：1234');
              }}
            />
          </>
        )}
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
      </ProForm>
    </div>
  );
};

export default Login;