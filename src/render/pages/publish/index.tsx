import React from 'react';
import { Form, Switch, Input, FormInstance } from 'antd';

export interface IPublishProps {
  form: React.RefObject<FormInstance<any>>;
}

const { Item } = Form;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

export default (props: IPublishProps) => {
  const { form } = props;

  return (
    <Form ref={form} {...layout}>
      <Item label="页面名称" name="pageName">
        <Input placeholder="请输入页面名称" />
      </Item>
      <Item label="是否私有" name="isPrivate">
        <Switch />
      </Item>
    </Form>
  )
}