import React from 'react';
import { message, Table, Switch, Space, Popconfirm, Button } from "antd";

import './index.less';
import { deletePage, getAllPage, updatePage } from 'src/apis/lambda/page';
import { navigateTo } from 'src/utils/navigator';
import { handle500 } from 'src/utils/error';

export interface IPageListProps {

}

export interface IPageListState {
  pageList: Array<IPageList>;
  loading: boolean;
}

interface IPageList {
  page_id: number;
  page_user_id: string;
  page_name: string;
  page_schema: string;
  page_authority: PageAuthority;
  page_enter_id: string;
  page_delete: Delete;
  page_create_time: Date;
  page_update_time: Date;
}

enum PageAuthority {
  public,
  private
}

enum Delete {
  true,
  false
}

export default class PageList extends React.Component<IPageListProps, IPageListState> {
  constructor(props: IPageListProps) {
    super(props);
    this.state = {
      pageList: [],
      loading: true
    }
  }

  componentDidMount() {
    this.getPageList();
  }

  getPageList = () => {
    getAllPage().then(val => {
      if (!val.success && val.success !== undefined) {
        message.success('获取数据成功!', 1);
        this.setState({
          pageList: val.data ?? []
        })
      } else {
        message.error(val.msg);
      }
    }).finally(() => this.setState({ loading: false }))
  }

  changeAuthority = (value: boolean, pageId: number) => {
    updatePage({
      pageId,
      isPrivate: value ? PageAuthority.public : PageAuthority.private
    }).then(val => {
      if (!val.success && val !== undefined) {
        message.success('修改成功!');
      } else {
        message.error(val.msg);
      }
    }).catch((err) => {
      message.error(err);
      handle500();
    })
  }

  exportSchema = (pageSchema: string) => {
    let textArea = document.createElement("textarea");
    textArea.value = pageSchema;
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

  deletePage = (pageId: number | number[]) => {
    deletePage({ pageId })
      .then(val => {
        if (!val.success && val.success !== undefined) {
          message.success('删除成功, 拉取数据···', 1.5, () => {
            this.getPageList();
          });
        } else {
          message.error(val.msg, 2);
        }
      })
  }

  render() {
    const { pageList, loading } = this.state;

    const columns = [
      {
        title: '页面ID',
        dataIndex: 'page_id',
        key: 'page_id'
      },
      {
        title: '页面名称',
        dataIndex: 'page_name',
        key: 'page_name'
      },
      {
        title: '页面enterId',
        dataIndex: 'page_enter_id',
        key: 'page_enter_id',
        render: (id: string) => <a onClick={() => navigateTo(`page?page_id=${id}`)}>{id}</a>
      },
      {
        title: '页面是否公开',
        dataIndex: 'page_authority',
        key: 'page_authority',
        render: (authority: PageAuthority, record: IPageList) => <Switch defaultChecked={authority === PageAuthority.public ? true : false} onChange={(value: boolean) => this.changeAuthority(value, record.page_id)} />
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: any, record: IPageList) => (
          <Space size="middle">
            <Button type="primary" onClick={() => navigateTo(`create?page_id=${record.page_id}`)}>编辑</Button>
            <Button type="primary" onClick={() => this.exportSchema(record.page_schema)}>分享</Button>
            <Popconfirm
              title="确认删除?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => this.deletePage(record.page_id)}
            >
              <Button type="primary" danger>删除</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]

    return (
      <div>
        <Table
          dataSource={pageList}
          columns={columns}
          loading={loading}
        />
      </div>
    )
  }
}