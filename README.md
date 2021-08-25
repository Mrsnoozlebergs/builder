## 搭建编辑器

- 支持可视化搭建
- 一键部署发布页面

## 本地开发

```shell
// 安装依赖
npm i --registry=https://registry.npm.taobao.org
// 本地启动
npm run dev
// 打开 localhost:3000/#/login
```

## 新组件开发流程
> src/render/components 下创建组件 如 xxx.tsx

```jsx
import React from 'react';
import { RendererProps } from 'src/interface/fatory';
import { Renderer } from 'src/utils/factory';

export interface xxxSchema {
  /**
   * type 
   */
  type?: 'xxx'
  /**
   * xxx属性
   */
  xxx?: 'xxx'
}
// 注册组件
@Renderer<xxxSchema>({
  test: /(^|\/)xxx$/, // 正则匹配组件
  name: 'xxx', // 组件名称
  defaultData: { // 组件默认数据
    xxx: 'xxx',
  }
})
export default class XxxRenderer extends React.Component<XxxSchema & RendererProps, any> {
  render() {
    const { xxx, ...rest } = this.props;
    return <CustomComponent xxx={xxx} {...rest}></CustomComponent>
}
```
> 到src/render/components/index 中注册一下组件
```javascript
import './Xxx.tsx';
```

> 组件与编辑器需要并行开发 src/utils/Editor 创建XxxEditor.tsx 编辑器采用 antd form
```jsx
import React from 'react';
import { XxxSchema } from 'src/render/components/Xxx';
import { EditorRenderer } from '../factory';
import { Form, Input, Radio, Switch } from 'antd';
import _ from 'lodash';
import { BaseEditorProps } from './BaseEditor';

@EditorRenderer<XxxSchema, XxxSchema>({
  test: /(^|\/)xxx$/, // 正则匹配 type
  name: 'xxx', // 名称
  helper: (value: XxxSchema) => value // value helper 编辑器表单产生的数据通过 helper 转换 为 schema
})
export default class XxxEditor extends React.Component<XxxSchema & BaseEditorProps, any> {
  static displayName = 'XxxEditor';

  constructor(props: XxxSchema & BaseEditorProps) {
    super(props);
  }

  render() {
    const { xxx } = this.props;

    return (
      <>
        <Form.Item label="Xxx" name="Xxx" initialValue={xxx}>
          <Input />
        </Form.Item>
      </>
    )
  }
}
```
> 同理组件编辑器需要在 src/utils/Editor/index 中注册
```javascript
import './XxxEditor.tsx';
```