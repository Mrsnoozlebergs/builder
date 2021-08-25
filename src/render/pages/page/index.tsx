import { Layout, message, Spin, Tooltip } from 'antd';
import React from 'react';
import { Layout as LayoutSchema, PageSchema } from 'src/interface/schema';
import SchemaRender from 'src/utils/schemaRender';
import { getHashUrlParams } from 'src/utils/simpleUtils';
import { CopyTwoTone } from '@ant-design/icons';

import './index.less';
import { getPageByPageEnterId } from 'src/apis/lambda/page';
import { handle500 } from 'src/utils/error';

export interface IPageProps {
  pageSchema: PageSchema;
}

export interface IPageState {
  pageSchema: PageSchema;
  loading: boolean;
  isPrivate: number;
}

const { Header, Sider, Content, Footer } = Layout;

class Page extends React.Component<IPageProps, IPageState> {
  constructor(props: IPageProps) {
    super(props);
    this.state = {
      pageSchema: props.pageSchema || {
        content: {
          title: '默认搭建页面',
        }
      },
      loading: false,
      isPrivate: 1
    }
  }

  async componentDidMount() {
    await this.getPageList();
  }

  getPageList = async () => {
    const page_id = getHashUrlParams('page_id');
    if (!page_id) return message.error('page_id 不能为空!');
    this.setState({
      loading: true
    })
    getPageByPageEnterId(page_id)
      .then(val => {
        if (val.success === undefined) {
          return message.error('服务器内部错误!');
        }
        if (!val.success) {
          message.success('请求配置成功!', 1, () => {
            message.loading('加载页面中···', 1.5, () => {
              this.setState({
                pageSchema: JSON.parse(val.data?.page_schema!),
                loading: false,
                isPrivate: val.data?.page_authority ?? 1
              })
            })
          });
        } else {
          message.error(val.msg, 2);
          this.setState({
            loading: false
          })
        }
      })
      .catch(err => {
        message.error(JSON.stringify(err));
        handle500();
        this.setState({
          loading: false
        })
      })
  }

  renderHeader(header: LayoutSchema) {
    const { title, componets } = header;

    return (
      <Header style={{
        background: '#fff',
        display: 'flex',
        flexDirection: 'row'
      }}>
        <div>
          {title}
        </div>
        <div>
          {
            componets?.map((item, idx) => (
              <SchemaRender
                boxStyle={item.style ?? {}}
                key={idx}
                schema={item.schema}
                $path={`header/${item.schema.type}/${idx}`}
                online
              />
            ))
          }
        </div>
      </Header>
    )
  }

  renderSider(sider: LayoutSchema) {
    return (
      <Sider>

      </Sider>
    )
  }

  renderContent(content: LayoutSchema) {
    const { title, componets } = content;

    return (
      <Content>
        <div>
          {title}
        </div>
        {
          componets && componets?.length > 0 ? 
          (
            <div>
              {
                componets?.map((item, idx) => (
                  <SchemaRender
                    boxStyle={item.style ?? {}}
                    key={idx}
                    schema={item.schema}
                    $path={`content/${item.schema.type}/${idx}`}
                    online
                  />
                ))
              }
            </div>
          ) : null
        }
      </Content>
    )
  }

  renderFooter(footer: LayoutSchema) {
    return (
      <Footer>

      </Footer>
    )
  }

  renderPage(pageSchema: PageSchema) {

    return (
      <Layout style={{
        height: '100vh',
        width: '100vw'
      }}>
        {
          pageSchema.header ? this.renderHeader(pageSchema.header) : null
        }
        {
          pageSchema.siderLeft || pageSchema.siderRight ? 
          (
            <Layout>
              {
                pageSchema.siderLeft ? this.renderSider(pageSchema.siderLeft) : null
              }
              {
                this.renderContent(pageSchema.content)
              }
              {
                pageSchema.siderRight ? this.renderSider(pageSchema.siderRight) : null
              }
            </Layout>
          ) : this.renderContent(pageSchema.content)
        }
        {
          pageSchema.footer ? this.renderFooter(pageSchema.footer) : null
        }
      </Layout>
    )
  }

  exportSchema = () => {
    const { pageSchema } = this.state;
    let textArea = document.createElement("textarea");
    textArea.value = JSON.stringify(pageSchema);
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        let successful = document.execCommand('copy');
        if (successful === true) {
            message.success("复制成功！");
        } else {
            message.success("该浏览器不支持点击复制到剪贴板");
        }
    } catch (err) {
        alert('该浏览器不支持点击复制到剪贴板');
    }
    document.body.removeChild(textArea);
  }

  render() {
    const { pageSchema, loading, isPrivate } = this.state;

    return (
      <>
        <Spin 
          size="large"
          tip="请求配置中···"
          spinning={loading}
        >
          {this.renderPage(pageSchema)}
          {
            isPrivate ? null :
            (
              <Tooltip title="点击复制schema, 当页面为公开时可复制!">
                <CopyTwoTone className="share" onClick={this.exportSchema} />
              </Tooltip>
            )
          }
        </Spin>
      </>
    )
  }
}

export default Page;