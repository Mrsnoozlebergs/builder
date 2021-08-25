import { Layout, Button, message, Drawer, Popconfirm, Modal, FormInstance, Spin } from 'antd';
import { SyncOutlined, CheckCircleTwoTone, SettingTwoTone } from '@ant-design/icons';
import React from 'react';
import { Subscription } from 'rxjs';
import { Layout as LayoutSchema, PageSchema } from 'src/interface/schema';
import BaseEditor from 'src/utils/Editor/BaseEditor';
import SimpleEditor, { IBoxValue } from 'src/utils/Editor/SimpleEditor';
import EditorTool, { IClientInfo } from 'src/utils/editorTool/editorTool';
import Event from 'src/utils/Event';
import SchemaRender from 'src/utils/schemaRender';
import _, { findIndex } from 'lodash';
import './index.less';
import { navigateTo } from 'src/utils/navigator';
import { getPageByPageId, publishPage, updatePage } from 'src/apis/lambda/page';
import { handle500 } from 'src/utils/error';
import SchemaTree from '../tree';
import Editor, { OnMount } from '@monaco-editor/react';
import { validate } from 'src/utils/validateSchema';
import Publish from '../publish';
import { getHashUrlParams } from 'src/utils/simpleUtils';
import { getRenderer } from 'src/utils/factory';

const { Header, Sider, Content, Footer } = Layout;

interface IProps {

}

interface IState {
  /**
   * 页面shcema
   */
  pageSchema: PageSchema;
  /**
   * editorTool 依赖的数据
   */
  clientInfo: IClientInfo;
  /**
   * 当前编辑中的schema
   */
  editorSchema: any;
  /**
   * 编辑器的 subscription 用于取消订阅
   */
  editorSubscription: Subscription | null;
  /**
   * 树形编辑器的监听 subscription 用于取消订阅
   */
  treeSubscription: Subscription | null;
  /**
   * 盒子模型编辑器的监听 subscription 用于取消订阅
   */
  boxSubscription: Subscription | null;
  /**
   * 当前的 path 
   */
  curPath: string;
  /**
   * 是否在保存数据
   */
  saving: boolean;
  /**
   * 预览状态
   */
  preview: boolean;
  /**
   * 预览工具
   */
  showPreviewTool: boolean;
  /**
   * 导入工具
   */
  showImportModalTool: boolean;
  /**
   * 发布工具
   */
  showPublishModalTool: boolean;
  /**
   * modal editor
   */
  modalEditor: any;
  /**
   * 判断当前是编辑态还是新建
   */
  isEditMode: boolean;
  /**
   * pageId 页面id 当 isEditMode === true 时有意义
   */
  pageId: number;
  /**
   * page_enter_id 当 isEditMode === true 时有意义
   */
  pageEnterId: string;
  /**
   * 当前 Page 部分相关信息
   */
  pageInfo: {
    pageName?: string;
    isPrivate?: number;
  }
  /**
   * 编辑区 loading
   */
  editorAreaLoading: boolean;
  /**
   * 组件添加 Drawer 
   */
  showAddComponentTab: boolean;
  /**
   * 当前选中的组件 name 
   */
  selectedComponentName: string;
  /**
   * 当前选中的组件 idx
   */
  selectedCOmponentIdx: number;
}

export default class Create extends React.Component<IProps, IState> {
  /**
   * FormInstance
   */
  form: React.RefObject<FormInstance<any>>;

  constructor(props: IProps) {
    super(props);
    this.form = React.createRef<FormInstance>();;
    this.state = {
      pageSchema: {
        header: {
          title: '测试',
          componets: [
            {
              schema: {
                type: 'button'
              }
            }
          ]
        },
        content: {
          title: '默认搭建页面',
          componets: [
            {
              schema: {
                type: 'button'
              }
            },
            {
              schema: {
                type: 'tabs'
              }
            },
            {
              schema: {
                type: 'button'
              }
            }
          ]
        }
      },
      clientInfo: {
        clientHeight: 0,
        clientWidth: 0,
        offsetLeft: 0,
        offsetTop: 0,
        schema: {}
      },
      editorSchema: {},
      editorSubscription: null,
      treeSubscription: null,
      boxSubscription: null,
      curPath: 'root',
      saving: false,
      preview: false,
      showPreviewTool: false,
      showImportModalTool: false,
      showPublishModalTool: false,
      modalEditor: null,
      isEditMode: false,
      pageInfo: {},
      pageId: -1,
      pageEnterId: '',
      editorAreaLoading: true,
      showAddComponentTab: false,
      selectedCOmponentIdx: -1,
      selectedComponentName: ''
    }
  }

  componentDidMount() {
    // 获取 pageId 判断当前是否为编辑状态
    const pageId = getHashUrlParams('page_id');

    // 如果不是编辑态默认读取缓存
    if (pageId) {
      getPageByPageId(parseInt(pageId)).then(val => {
        if (!val.success && val.success !== undefined) {
          if (!val.data) {
            message.error('page_id配置丢失! 读取缓存中···', 1.5, () => {
              // 读取缓存
              const schemaCacheFromLocal = localStorage.getItem('schemaCache') || 'null';
              const schemaCache = JSON.parse(schemaCacheFromLocal);
              if (schemaCache !== null) {
                message.success('读取到缓存的schema, 应用缓存schema!', 1);
                this.setState({
                  pageSchema: schemaCache,
                  editorAreaLoading: false
                })
              }
            })
          } else {
            const { page_schema, page_enter_id, page_authority, page_name } = val.data;
            message.success('读取配置成功!', 0.5, () => {
              message.loading('加载页面中···', 1, () => {
                this.setState({
                  pageSchema: JSON.parse(page_schema),
                  pageId: parseInt(pageId),
                  pageEnterId: page_enter_id,
                  editorAreaLoading: false,
                  isEditMode: true,
                  pageInfo: {
                    pageName: page_name,
                    isPrivate: page_authority
                  }
                })
              })
            });
          }
        }
      })
    } else {
      // 读取缓存
      const schemaCacheFromLocal = localStorage.getItem('schemaCache') || 'null';
      const schemaCache = JSON.parse(schemaCacheFromLocal);
      if (schemaCache !== null) {
        message.success('读取到缓存的schema, 应用缓存schema!', 1);
        this.setState({
          pageSchema: schemaCache,
        })
      }

      this.setState({
        editorAreaLoading: false
      })
    }
    // 初始化 editor observerable 监听
    const subscription = Event.on<any>('editorValueChange')?.subscribe(value => {
      console.log('editor value change: ', value);
      // saving
      this.setState({
        saving: true
      })
      const { pageSchema } = this.state;
      const curPaths = this.handlePath();
      const idx = curPaths.splice(0, 1)[0];
      const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];
      const newPageSchema = _.cloneDeep(pageSchema);

      curPaths.forEach(item => {
        newPageSchema[idx as keyof PageSchema]?.componets?.map((component: any, index: number) => {
          if (component.schema.type === item && index === parseInt(componentIdx)) {
            const newComponent = Object.assign(component, { schema: Object.assign(component.schema, value) });

            return newComponent;
          }

          return item;
        })
      })

      // 缓存 schema 
      localStorage.setItem('schemaCache', JSON.stringify(newPageSchema));
      // loading
      setTimeout(() => {
        this.setState({
          pageSchema: newPageSchema,
          saving: false
        })
      }, 500)
    })

    // 初始化 tree observerable 监听
    const treeSubscription = Event.on<PageSchema>('treeValueChange')?.subscribe(value => {
      console.log('tree value change: ', value);
      // saving
      this.setState({
        saving: true
      })

      // 缓存 schema
      localStorage.setItem('schemaCache', JSON.stringify(value));
      // loading
      setTimeout(() => {
        this.setState({
          pageSchema: value,
          saving: false
        })
      }, 500)
    })!;

    // 初始化 box observerable 监听
    const boxSubscription = Event.on<IBoxValue>('boxValueChange')?.subscribe((value) => {
      console.log('box value change: ', value);
      // saving
      this.setState({
        saving: true
      })
      const { type, direction, value: v } = value;
      const { pageSchema } = this.state;
      const curPaths = this.handlePath();
      const idx = curPaths.splice(0, 1)[0];
      const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];
      const newPageSchema = _.cloneDeep(pageSchema);

      let style: React.CSSProperties = {};

      switch (type) {
        case 'margin':
          switch (direction) {
            case 'bottom':
              style.marginBottom = v + 'px';
              break;
            case 'top':
              style.marginTop = v + 'px';
              break;
            case 'left':
              style.marginLeft = v + 'px';
              break;
            case 'right':
              style.marginRight = v + 'px';
              break;
            default:
              style.margin = 0;
              break;
          }
          break;
        case 'padding':
          switch (direction) {
            case 'bottom':
              style.paddingBottom = v + 'px';
              break;
            case 'top':
              style.paddingTop = v + 'px';
              break;
            case 'left':
              style.paddingLeft = v + 'px';
              break;
            case 'right':
              style.paddingRight = v + 'px';
              break;
            default:
              style.padding = 0;
              break;
          }
          break;
        case 'border':
          switch (direction) {
            case 'bottom':
              style.borderBottom = v + 'px';
              break;
            case 'top':
              style.borderTop = v + 'px';
              break;
            case 'left':
              style.borderLeft = v + 'px';
              break;
            case 'right':
              style.borderRight = v + 'px';
              break;
            default:
              style.border = 0;
              break;
          }
          break;
        case 'self':
          switch (direction) {
            case 'left':
              style.width = v + 'px';
              break;
            case 'right':
              style.height = v + 'px';
              break;
          }
          break;
      }

      curPaths.forEach(item => {
        newPageSchema[idx as keyof PageSchema]?.componets?.map((component, index: number) => {
          if (component.schema.type === item && index === parseInt(componentIdx)) {
            const newComponent = Object.assign(component, { style: Object.assign(component.style ?? {}, style) });

            return newComponent;
          }

          return item;
        })
      })

      // 缓存 schema
      localStorage.setItem('schemaCache', JSON.stringify(newPageSchema));
      // loading
      setTimeout(() => {
        this.setState({
          saving: false,
          pageSchema: newPageSchema
        })
      }, 500)
    })!;

    this.setState({
      editorSubscription: subscription!,
      treeSubscription,
      boxSubscription
    })
  }

  componentWillUnmount() {
    const { editorSubscription, treeSubscription, boxSubscription } = this.state;
    // 取消订阅
    editorSubscription?.unsubscribe();
    treeSubscription?.unsubscribe();
    boxSubscription?.unsubscribe();
  }

  handlePath = () => {
    const { curPath } = this.state;
    const paths = curPath.split('/');

    return paths;
  }

  clickComponent = (cur: any, schema: any, id: string, $path: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (cur === null) {
      cur = document.getElementById(id);
    }
    const { clientHeight, clientWidth, offsetLeft, offsetTop } = cur;

    const info: IClientInfo = {
      clientHeight,
      clientWidth,
      offsetTop,
      offsetLeft,
      schema
    }

    this.setState({
      clientInfo: info,
      editorSchema: schema,
      curPath: $path
    })
  }

  renderEditorTool = (clientInfo: IClientInfo) => {

    return (
      <EditorTool
        info={clientInfo}
        add={() => this.setState({ showAddComponentTab: true })}
        delete={this.deleteComponent}
        change={this.changeComponentOrder}
      />
    )
  }

  renderHeader(header: LayoutSchema) {
    const { preview } = this.state;
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
                click={this.clickComponent}
                preview={preview}
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
    const { preview } = this.state;
    const { title, componets } = content;

    return (
      <Content>
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
                $path={`content/${item.schema.type}/${idx}`}
                click={this.clickComponent}
                preview={preview}
              />
            ))
          }
        </div>
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
      <Layout>
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

  quit = () => {
    const { saving } = this.state;
    if (saving) return message.error('保存中, 请勿退出!');

    navigateTo('index');
  }

  preview = (status: boolean) => {
    this.setState({
      preview: status,
      showPreviewTool: false
    })
  }

  reset = () => {
    message.loading('正在重置页面', 1.5, () => {
      localStorage.removeItem('schemaCache');

      this.setState({
        pageSchema: {
          header: {
            title: '测试',
            componets: [
              {
                schema: {
                  type: 'button'
                }
              }
            ]
          },
          content: {
            title: '默认搭建页面',
            componets: [
              {
                schema: {
                  type: 'button'
                }
              },
              {
                schema: {
                  type: 'tabs'
                }
              },
              {
                schema: {
                  type: 'button'
                }
              }
            ]
          }
        },
        clientInfo: {
          clientHeight: 0,
          clientWidth: 0,
          // 重置以后 因为没有默认的 curPath 导致 editorTool会出现在左上角 0 0的位置 所以在 reset 时移出屏幕隐藏
          offsetLeft: -100,
          offsetTop: -100,
          schema: {}
        },
        editorSchema: {},
        editorSubscription: null,
        treeSubscription: null,
        boxSubscription: null,
        curPath: 'root',
        saving: false,
        preview: false,
        showPreviewTool: false,
        showImportModalTool: false,
        showPublishModalTool: false,
        modalEditor: null,
        isEditMode: false,
        pageInfo: {},
        pageId: -1,
        pageEnterId: '',
        editorAreaLoading: false,
        showAddComponentTab: false,
        selectedCOmponentIdx: -1,
        selectedComponentName: ''
      })
    })
  }

  importBySchema = () => {
    const { modalEditor } = this.state;
    modalEditor?.setValue('');
    this.setState({
      showImportModalTool: true
    })
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

  importModalToolMount: OnMount = (editor) => {
    this.setState({
      modalEditor: editor
    })
  }

  handleOk = () => {
    const { modalEditor } = this.state;
    const schema = modalEditor.getValue();

    if (!validate(schema)) return;

    this.setState({
      showImportModalTool: false,
      pageSchema: JSON.parse(schema)
    })
  }

  handleCancel = () => {
    this.setState({
      showImportModalTool: false
    })
  };

  publishToolHandleOk = () => {
    const { pageName = '测试页面', isPrivate = false } = this.form.current?.getFieldsValue();

    const { pageSchema, isEditMode, pageId, pageEnterId } = this.state;

    if (isEditMode) {
      updatePage({
        pageId,
        isPrivate: isPrivate ? 1 : 0,
        pageName,
        schema: JSON.stringify(pageSchema)
      }).then(val => {
        if (!val.success && val.success !== undefined) {
          message.success('发布成功, 等待跳转···', 1.5, () => {
            navigateTo(`page?page_id=${pageEnterId}`);
            // 发布成功后清空缓存
            localStorage.removeItem('schemaCache');
          });
        } else {
          message.error(val.msg, 2);
        }
      }).catch(err => {
        message.error(JSON.stringify(err));
        handle500();
      }).finally(() => {
        this.setState({
          showPublishModalTool: false
        })

        this.form.current?.resetFields();
      })
    } else {
      publishPage({
        schema: JSON.stringify(pageSchema),
        isPrivate: isPrivate ? 1 : 0,
        pageName,
        currentVersion: '1.0.0',
      }).then(val => {
        if (val.success === undefined) {
          return message.error('服务器内部错误!');
        }
        if (!val.success) {
          message.success('发布成功, 等待跳转···', 1.5, () => {
            navigateTo(`page?page_id=${val.data?.page_enter_id}`);
            // 发布成功后清空缓存
            localStorage.removeItem('schemaCache');
          });
        } else {
          message.error(val.msg, 2);
        }
      }).catch(err => {
        message.error(JSON.stringify(err));
        handle500();
      }).finally(() => {
        this.setState({
          showPublishModalTool: false
        })

        this.form.current?.resetFields();
      })
    }
  }

  publishToolToggleShow = (visible: boolean) => {
    const { isEditMode, pageInfo: { pageName, isPrivate } } = this.state;
    this.setState({
      showPublishModalTool: visible
    }, () => {
      if (isEditMode) {
        // FIXME @tengpengfei antd Switch 使用 FormInstance.setFieldsValue 设置初始值失效问题 https://github.com/ant-design/ant-design/issues/17683
        this.form.current?.setFieldsValue({
          pageName,
          isPrivate: isPrivate === 1
        })
      }
    })
  }

  addComponent = () => {
    // saving
    this.setState({
      saving: true
    })

    const { selectedComponentName } = this.state;
    const addComponent = {
      schema: {
        type: selectedComponentName
      }
    }

    const { pageSchema } = this.state;
    const curPaths = this.handlePath();
    const idx = curPaths.splice(0, 1)[0];
    const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];
    const newPageSchema = _.cloneDeep(pageSchema);

    let findIdx = -1;

    curPaths.forEach(item => {
      findIdx = newPageSchema[idx as keyof PageSchema]?.componets?.findIndex((component: any, index: number) => (component.schema.type === item && index === parseInt(componentIdx))) ?? -1;
    })

    if (findIdx === -1) return message.error('系统错误');

    newPageSchema[idx as keyof PageSchema]?.componets?.splice(findIdx + 1, 0, addComponent);

    // 缓存 schema
    localStorage.setItem('schemaCache', JSON.stringify(newPageSchema));
    // loading
    setTimeout(() => {
      this.setState({
        saving: false,
        pageSchema: newPageSchema,
        showAddComponentTab: false
      })
    }, 500)
  }

  deleteComponent = () => {
    // saving
    this.setState({
      saving: true
    })

    const { pageSchema } = this.state;
    const curPaths = this.handlePath();
    const idx = curPaths.splice(0, 1)[0];
    const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];
    const newPageSchema = _.cloneDeep(pageSchema);

    let findIdx = -1;

    curPaths.forEach(item => {
      findIdx = newPageSchema[idx as keyof PageSchema]?.componets?.findIndex((component: any, index: number) => (component.schema.type === item && index === parseInt(componentIdx))) ?? -1;
    })

    if (findIdx === -1) {
      this.setState({ saving: false });
      return message.error('系统错误');
    }

    newPageSchema[idx as keyof PageSchema]?.componets?.splice(findIdx, 1);

    // 缓存 schema
    localStorage.setItem('schemaCache', JSON.stringify(newPageSchema));
    // loading
    setTimeout(() => {
      this.setState({
        saving: false,
        pageSchema: newPageSchema
      })
    }, 500)
  }

  changeComponentOrder = (direction: 'up' | 'down') => {
    if (!direction) return message.error('移动出现错误!');

    // saving
    this.setState({
      saving: true
    })

    const { pageSchema } = this.state;
    const curPaths = this.handlePath();
    const idx = curPaths.splice(0, 1)[0];
    const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];
    const newPageSchema = _.cloneDeep(pageSchema);

    let findIdx = -1;

    curPaths.forEach(item => {
      findIdx = newPageSchema[idx as keyof PageSchema]?.componets?.findIndex((component: any, index: number) => (component.schema.type === item && index === parseInt(componentIdx))) ?? -1;
    })

    if (findIdx === -1) {
      this.setState({ saving: false });
      return message.error('系统错误');
    }

    /**
     * 处理特殊情况
     * 1. 当前组件为 子容器下第一个元素 findIdx === 0 && direction === 'up' 无法移动!
     * 2. 当前组件为 子容器下最后一个元素 findIdx === components.length - 1 && direction === 'down' 无法移动!
     */

    if (findIdx === 0 && direction === 'up') {
      this.setState({ saving: false });
      return message.error('无法移动! 已经是最顶层元素! 需要移动使用左侧Tree!');
    } else if ((findIdx === newPageSchema[idx as keyof PageSchema]!.componets!.length - 1 && direction === 'down')) {
      this.setState({ saving: false });
      return message.error('无法移动! 已经是最底层元素! 需要移动使用左侧Tree!');
    }

    const hanldingComponent = newPageSchema[idx as keyof PageSchema]?.componets?.splice(findIdx, 1);

    if (!hanldingComponent) {
      this.setState({ saving: false });
      return message.error('未找到当前选中组件!');
    }

    newPageSchema[idx as keyof PageSchema]?.componets?.splice(findIdx + (direction === 'up' ? -1 : 1), 0, hanldingComponent[0]);

    // 缓存 schema
    localStorage.setItem('schemaCache', JSON.stringify(newPageSchema));
    // loading
    setTimeout(() => {
      this.setState({
        saving: false,
        pageSchema: newPageSchema
      })
    }, 500)

  }

  render() {
    const {
      pageSchema,
      clientInfo,
      editorSchema,
      curPath,
      saving,
      preview,
      showPreviewTool,
      showImportModalTool,
      showPublishModalTool,
      editorAreaLoading,
      showAddComponentTab,
      selectedCOmponentIdx
    } = this.state;

    return (
      <Layout>
        {
          !preview ?
            (
              <Header className="create-header">
                <div className="create-header-container">
                  <span className="create-header-title">搭建编辑器</span>
                  <div className="create-header-saving">
                    <span className="create-header-saving-text">{saving ? '保存中' : '已保存'}</span>
                    {
                      saving ?
                        <SyncOutlined spin style={{
                          color: '#fff'
                        }} /> :
                        <CheckCircleTwoTone twoToneColor="#52c41a" />
                    }
                  </div>
                </div>
                <div className="create-header-button">
                  <Button className="create-header-button-preview" type="default" onClick={() => this.preview(true)}>预览</Button>
                  <Button className="create-header-button-preview" type="primary" onClick={this.importBySchema}>导入</Button>
                  <Button className="create-header-button-preview" type="primary" onClick={this.exportSchema}>导出</Button>
                  <Popconfirm
                    title="确认发布?"
                    okText="确定"
                    cancelText="取消"
                    onConfirm={() => this.publishToolToggleShow(true)}
                  >
                    <Button className="create-header-button-publish" type="primary">发布</Button>
                  </Popconfirm>
                  <Popconfirm
                    title="确认重置?"
                    okText="确定"
                    cancelText="取消"
                    onConfirm={this.reset}

                  >
                    <Button className="create-header-button-exit" type="primary" danger>重置</Button>
                  </Popconfirm>
                  <Button className="create-header-button-exit" type="primary" danger onClick={this.quit}>退出</Button>
                </div>
              </Header>
            ) : null
        }
        <Spin
          size="large"
          tip="加载页面中···"
          spinning={editorAreaLoading}
        >
          <Layout
            style={
              preview ? {
                position: 'fixed',
                height: '100vh',
                width: '100vw',
                zIndex: 1000
              } : {
                height: 'calc(100vh - 64px)'
              }
            }
          >
            {
              !preview ?
                <Sider>
                  <SchemaTree
                    schema={pageSchema}
                  />
                </Sider> : null
            }
            <Content style={{
              padding: '10px'
            }}>
              {
                this.renderPage(pageSchema)
              }
              {!preview ? this.renderEditorTool(clientInfo) : null}
              {
                preview && !showPreviewTool ?
                  <SettingTwoTone
                    className="create-preview-tool"
                    onClick={() => this.setState({ showPreviewTool: true })}
                  />
                  : null
              }
              <Drawer
                title="添加组件"
                width="400"
                visible={showAddComponentTab}
                placement="left"
                onClose={() => this.setState({ showAddComponentTab: false })}
              >
                <div className="cList">
                  {
                    getRenderer().map((config, idx) => (
                      <div className={`cList-component ${idx === selectedCOmponentIdx ? 'cList-component-selected' : ''}`} onClick={() => this.setState({ selectedComponentName: config.name!, selectedCOmponentIdx: idx })}>
                        <span>{config.name}</span>
                      </div>
                    ))
                  }
                </div>
                <Button className="cList-btn" type="primary" disabled={selectedCOmponentIdx === -1} onClick={this.addComponent}>确认</Button>
              </Drawer>
              <Drawer
                title="选项"
                width="400"
                visible={showPreviewTool && preview}
                onClose={() => this.setState({ showPreviewTool: false })}
              >
                <div className="create-preview-button">
                  <Button className="create-preview-button-preview" type="primary" onClick={() => this.preview(false)} danger>退出预览</Button>
                  <Button className="create-header-button-preview" type="primary" onClick={this.exportSchema}>导出</Button>
                  <Popconfirm
                    title="确认发布?"
                    okText="确定"
                    cancelText="取消"
                    onConfirm={() => this.publishToolToggleShow(true)}
                  >
                    <Button className="create-header-button-publish" type="primary">发布</Button>
                  </Popconfirm>
                </div>
                <Editor
                  height={"70vh"}
                  theme={"light"}
                  language={"json"}
                  value={JSON.stringify(pageSchema, null, 2)}
                  options={{
                    minimap: {
                      enabled: false
                    },
                    readOnly: true
                  }}
                />
              </Drawer>
            </Content>
            {
              !preview ? (
                <Sider width="400" className="edit-container">
                  配置中心
                  <BaseEditor schema={editorSchema} $path={curPath} />
                  <SimpleEditor schema={pageSchema} $path={curPath} />
                </Sider>
              ) : null
            }
          </Layout>
        </Spin>
        {
          /**
           * import modal
           */
        }
        <Modal
          title="导入schema"
          visible={showImportModalTool}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width="900px"
        >
          <Editor
            height={"800px"}
            width={"800px"}
            language={"json"}
            onMount={this.importModalToolMount}
            value={''}
            options={{
              minimap: {
                enabled: false
              },
              formatOnPaste: true
            }}
          />
        </Modal>
        <Modal
          title="发布设置"
          visible={showPublishModalTool}
          onOk={this.publishToolHandleOk}
          onCancel={() => this.publishToolToggleShow(false)}
        >
          <Publish form={this.form} />
        </Modal>
      </Layout>
    )
  }
}