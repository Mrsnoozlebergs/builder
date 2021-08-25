import React from 'react';
import { ButtonSchema } from 'src/render/components/Button';
import { EditorRenderer } from '../factory';
import { Form, Input, Radio, Switch } from 'antd';
import { BaseEditorProps } from './BaseEditor';

@EditorRenderer<ButtonSchema, ButtonSchema>({
  test: /(^|\/)button$/,
  name: 'button',
  helper: (value: ButtonSchema) => value
})
export default class ButtonEditor extends React.Component<ButtonSchema & BaseEditorProps, any> {
  static displayName = 'ButtonEditor';

  render() {
    const { text, danger, disabled, btnType, size, shape } = this.props;

    return (
      <>
        <Form.Item label="名称" name="text" initialValue={text}>
          <Input />
        </Form.Item>
        <Form.Item label="类型" name="btnType" initialValue={btnType}>
          <Radio.Group>
            <Radio.Button value="primary">primary</Radio.Button>
            <Radio.Button value="ghost">ghost</Radio.Button>
            <Radio.Button value="dashed">dashed</Radio.Button>
            <Radio.Button value="link">link</Radio.Button>
            <Radio.Button value="text">text</Radio.Button>
            <Radio.Button value="default" defaultChecked>default</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Danger" name="danger">
          <Switch defaultChecked={danger || false} />
        </Form.Item>
        <Form.Item label="禁用" name="disabled">
          <Switch defaultChecked={disabled || false} />
        </Form.Item>
        <Form.Item label="形状" name="shape" initialValue={shape}>
          <Radio.Group>
            <Radio.Button value={undefined}>方形</Radio.Button>
            <Radio.Button value="circle">圆形</Radio.Button>
            <Radio.Button value="round">椭圆</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="尺寸" name="size" initialValue={size}>
          <Radio.Group>
            <Radio.Button value="small">小</Radio.Button>
            <Radio.Button value="middle">中</Radio.Button>
            <Radio.Button value="large">大</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </>
    )
  }
}