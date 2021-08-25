import { Button } from 'antd';
import React from 'react';
import { RendererProps } from 'src/interface/fatory';
import { Renderer } from 'src/utils/factory';

export interface ButtonSchema {
  /**
   * 按钮危险状态
   */
  danger?: boolean;
  /**
   * 按钮失效状态
   */
  disabled?: boolean;
  /**
   * 按钮类型
   */
  btnType?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
  /**
   * 文本
   */
  text?: string;
  /**
   * 尺寸
   */
  size?: 'large' | 'middle' | 'small';
  /**
   * 形状
   */
  shape?: "circle" | "round";
}

@Renderer<ButtonSchema>({
  test: /(^|\/)button$/,
  name: 'button',
  defaultData: {
    danger: false,
    disabled: false,
    btnType: 'default',
    text: '按钮',
    size: 'middle',
    shape: undefined
  }
})
export default class ButtonRenderer extends React.Component<ButtonSchema & RendererProps, any> {
  render() {
    const { text, cRef, btnType, style, shape, ...rest } = this.props;
    return <Button style={style} shape={shape} {...rest} type={btnType} ref={cRef}>{text}</Button>
  }
}