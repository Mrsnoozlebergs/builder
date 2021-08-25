import React from 'react';
import { TabsSchema } from 'src/render/components/Tabs';
import { BaseEditorProps } from './BaseEditor';
import { Form, Input, Radio, Button, message } from 'antd';
import { EditorRenderer } from '../factory';
import { MinusCircleOutlined, PlusOutlined, UpCircleOutlined, DownCircleOutlined } from '@ant-design/icons';


const { Item, List } = Form;

interface IFiledValues {
  tabs: string[];
  contents: string[];
  defaultActiveKey: string;
  size: 'small' | 'default' | 'large';
}

interface ITabsEditorState {

}

@EditorRenderer<IFiledValues, TabsSchema>({
  test: /(^|\/)tabs$/,
  name: 'tabs',
  helper: value => {
    const { tabs, contents, size, defaultActiveKey } = value;
    console.log('va', value);
    if (tabs.some(item => !item || item.length === 0)) {
      message.error('选项卡titile不能为空!');
      return {} as TabsSchema;
    }

    // tabsSchema transfer
    let tabsSchemaTabs: TabsSchema['tabs'] = [];
    tabs.forEach((item, idx) => {
      tabsSchemaTabs!.push({
        tab: item,
        key: idx.toString(),
        content: contents[idx]
      })
    })

    return {
      tabs: tabsSchemaTabs,
      size,
      defaultActiveKey
    }
  }
})
export default class TabsEditor extends React.Component<TabsSchema & BaseEditorProps, ITabsEditorState> {
  private addContent: any;
  private moveContent: any;
  private removeContent: any;

  constructor(props: TabsSchema & BaseEditorProps) {
    super(props);
    this.state = {

    }
  }

  render() {
    const { tabs, defaultActiveKey, size } = this.props;

    return (
      <>
        <Item label="选项卡管理">
          <Form.List
            name="tabs"
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 2) {
                    return Promise.reject(new Error('至少需要两个选项卡!'));
                  }
                },
              },
            ]}
            initialValue={tabs?.map(item => item.tab)}
          >
          {(fields, { add, remove, move }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  // {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                  required={true}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "请输入选项卡内容否则请删除它",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="选项卡内容" style={{ width: '75%' }} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <>
                      <UpCircleOutlined 
                      style={{
                        marginLeft: '5px'
                      }}
                      onClick={() => {
                        move(index, index - 1);
                        this.moveContent(index, index - 1)
                      }}
                      />
                      <DownCircleOutlined
                        style={{
                          margin: '0 5px'
                        }}
                        onClick={() => {
                          move(index, index + 1);
                          this.moveContent(index, index + 1);
                        }}
                      />
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => {
                          remove(field.name);
                          this.removeContent(index)
                        }}
                      />
                    </>
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    add('选项卡');
                    this.addContent('选项卡内容');
                  }}
                  style={{ width: '75%' }}
                  icon={<PlusOutlined />}
                >
                  添加一个选项卡
                </Button>
                <Button
                  type="dashed"
                  onClick={() => {
                    add('顶部选项卡', 0);
                    this.addContent('顶部选项卡', 0);
                  }}
                  style={{ width: '75%', marginTop: '20px' }}
                  icon={<PlusOutlined />}
                >
                  在顶部添加选项卡
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
        </Item>
        <Item label="选项卡内容">
            <List name="contents" initialValue={tabs?.map(item => item.content)}>
              {(fields, { add, move, remove }) => {
                this.addContent = add;
                this.moveContent = move;
                this.removeContent = (idx: number) => {
                  remove(fields[idx].name);
                };
                return fields.map((field, idx) => (
                  <Form.Item {...field}>
                    <Input />
                  </Form.Item>
                ))
              }
              }
            </List>
        </Item>
        <Item label="默认选中tab" name="defaultActiveKey" initialValue={defaultActiveKey || tabs?.[0].key || 0}>
          <Radio.Group>
            {
              tabs?.map((item, idx) => (
                <Radio.Button key={item.key || idx} value={item.key || idx}>{item.tab}</Radio.Button>
              ))
            }
          </Radio.Group>
        </Item>
        <Item label="大小" name="size" initialValue={size}>
          <Radio.Group>
            <Radio.Button value="small">small</Radio.Button>
            <Radio.Button value="default">default</Radio.Button>
            <Radio.Button value="large">large</Radio.Button>
          </Radio.Group>
        </Item>
      </>
    )
  }
}