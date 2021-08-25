import React from 'react';
import { Tabs } from 'antd';
import { Renderer } from 'src/utils/factory';
import { RendererProps } from 'src/interface/fatory';

const { TabPane } = Tabs;

export interface TabSchema {
  /**
   * 选项卡头显示文字
   */
  tab: string;
  /**
   * 对应的key
   */
  key?: string;
  /**
   * 内容
   */
  content?: string;
}

export interface TabsSchema {
  type?: 'tabs';
  /**
   * 选项卡
   */
  tabs?: Array<TabSchema>;
  /**
   * 默认选中
   */
  defaultActiveKey?: string;
  /**
   * 大小
   */
  size?: 'large' | 'default' | 'small';
}

@Renderer<TabsSchema>({
  test: /(^|\/)tabs$/,
  name: 'tabs',
  defaultData: {
    type: 'tabs',
    tabs: [
      {
        tab: '选项卡1',
        key: '0',
        content: '选项卡1'
      },
      {
        tab: '选项卡2',
        key: '1',
        content: '选项卡2'
      }
    ],
    defaultActiveKey: '0',
    size: 'default'
  }
})
export default class TabsRenderer extends React.Component<TabsSchema & RendererProps, any> {

  render() {
    const { tabs, defaultActiveKey = '0', size = 'default' as any, id, style } = this.props;

    return (
      <Tabs
        id={id}
        size={size}
        defaultActiveKey={defaultActiveKey}
        style={style ?? {}}
      >
        {
          tabs?.map((item, idx) => (
            <TabPane 
              key={item.key || idx.toString()}
              tab={item.tab}
            >
              {item.content}
            </TabPane>
          ))
        }
      </Tabs>
    )
  }
}