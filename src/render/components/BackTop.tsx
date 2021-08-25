import React from 'react';
import { RendererProps } from 'src/interface/fatory';
import { Renderer } from 'src/utils/factory';
import { BackTop } from 'antd';
import { VerticalAlignTopOutlined } from '@ant-design/icons'

const themeObj = {
  simple: { bgColor: '#fff', color: '#999' },
  black: { bgColor: '#000', color: '#fff' },
  danger: { bgColor: '#ff5050', color: '#fff' },
  primary: { bgColor: '#00bc71', color: '#fff' },
  blue: { bgColor: '#06c', color: '#fff' }
}

export type Theme = keyof typeof themeObj;

export interface BackTopSchema {
  /**
   * 主题
   */
  theme?: Theme;
  /**
   * 到什么高度出现
   */
   visibilityHeight?: number;
}

@Renderer<BackTopSchema>({
  test: /(^|\/)backtop$/,
  name: 'backtop',
  defaultData: {
    theme: 'simple',
    visibilityHeight: -200
  }
})
class BackToTop extends React.Component<RendererProps & BackTopSchema, any> {
  
  render() {
    const { theme = 'simple', style, isPreview, ...rest } = this.props;
     
    return (
    <BackTop {...rest} style={!isPreview ? {...style, right: '25%' } : style}>
      <VerticalAlignTopOutlined />
    </BackTop>
    )
  }
}

export default BackToTop;