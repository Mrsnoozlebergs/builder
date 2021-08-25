import React from 'react';
import { message, Tree } from 'antd';
import { PageSchema } from 'src/interface/schema';
import Event from 'src/utils/Event';
import _ from 'lodash';

export interface Tree {
  title: string;
  key: string;
  children?: Array<Tree>
}

export interface SimpleDiffResult {
  title: string;
  diff: {
    idx: number;
    nowIdx: number;
  }[]
}
export interface DiffResult {
  type: 'immutable' | 'add' | 'delete';
}
export interface ITreeProps {
  schema: PageSchema;
}

export interface ITreeState {
  schema: Array<Tree>;
  oldSchema: Array<Tree>;
  expandedKeys: Array<string>;
  pageSchema: PageSchema;
}

const defaultLayoutNames = [
  'header',
  'content',
  'siderLeft',
  'siderRight',
  'footer'
]

export default class SchemaTree extends React.Component<ITreeProps, ITreeState> {
  constructor(props: ITreeProps) {
    super(props);
    this.state = {
      schema: [],
      oldSchema: [],
      expandedKeys: ['content'],
      pageSchema: {} as PageSchema
    };
  }

  componentDidMount() {
    const { schema } = this.props;
    let schemaTreeData: any = [];
    Object.keys(schema).forEach(key => {
      const children: any = [];
      const item = schema[key as keyof PageSchema];

      item?.componets?.forEach((component, idx) => {
        children.push({
          title: component?.schema?.name || component?.schema?.type,
          key: `${key}-${component?.schema?.type}-${idx}`
        })
      })

      schemaTreeData.push({
        title: key,
        key,
        children
      })
    })

    this.setState({
      schema: schemaTreeData,
      pageSchema: schema
    })
  }

  componentDidUpdate(prevProps: ITreeProps) {
    if (!_.isEqual(prevProps.schema, this.props.schema)) {
      const { schema } = this.props;
      let schemaTreeData: any = [];
      Object.keys(schema).forEach(key => {
        const children: any = [];
        const item = schema[key as keyof PageSchema];

        item?.componets?.forEach((component, idx) => {
          children.push({
            title: component?.schema?.name || component?.schema?.type,
            key: `${key}-${component?.schema?.type}-${idx}`
          })
        })

        schemaTreeData.push({
          title: key,
          key,
          children
        })
      })

      this.setState({
        schema: schemaTreeData,
        pageSchema: schema
      })
    }
  }

  onDragEnter = (info: any) => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  onDrop = (info: any) => {
    let flag = false;
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data: string | any[], key: any, callback: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    const oldSchema = this.state.schema;
    const data = _.cloneDeep(oldSchema);

    // Find dragObject
    let dragObj: any;
    loop(data, dragKey, (item: any, index: any, arr: any[]) => {
      if (defaultLayoutNames.includes(item.title)) {
        flag = true;
      } else {
        arr.splice(index, 1);
        dragObj = item;
      }
    });

    if (flag) return message.error('布局不能移动!');

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: { children: any[]; }) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: { children: any[]; }) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar: any;
      let i: any;
      loop(data, dropKey, (item: any, index: any, arr: any) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    if (data.some((item: any) => !defaultLayoutNames.includes(item.title))) {
      message.error('组件不可以跳出布局!');
    } else if (data.some((item: any) => item.children && item.children.some((child: any) => child.children))) {
      message.error('暂不支持组件嵌套!');
    } else {
      Event.emit<PageSchema>('treeValue', );
      this.setState({
        schema: data,
        oldSchema
      });
    }
  };

  treeValueHelper = (info: any) => {
    this.diffSchema(this.state.oldSchema, this.state.schema);
  }

  findObj = (path: string) => {
    const paths = path.split('-');
    const idx = paths.splice(0, 1)[0];
    const componentIdx = paths.splice(paths.length - 1, 1)[0];
    const { pageSchema } = this.state;
    
    paths.forEach(item => {
      pageSchema[idx as keyof PageSchema]?.componets?.forEach((component: any, index: number) => {
        console.log('tpf:: ', component, index, item);
      })
    })
  }

  diffSchema = (oldSchema: Array<Tree>, schema: Array<Tree>) => {
    let result: Array<DiffResult & { idx: number, key: string }> = [];

    oldSchema.forEach((item, idx) => {
      result.push(Object.assign(this.layoutDiff(item, schema[idx]), { idx, key: item.key }));
    });

    const res = _.cloneDeep(this.state.pageSchema);

    // 出现了跨 layout 的组件移动
    if (result.some(_ => _.type !== 'immutable')) {
      if (result.findIndex(_ => _.type === 'add') === -1 && result.findIndex(_ => _.type === 'delete') === -1) {
        throw new Error('layout data error!');
      }

      const add = result.find(_ => _.type === 'add')!;
      const deleted = result.find(_ => _.type === 'delete');

      const fromIdx = oldSchema[deleted!.idx].children?.findIndex(old => schema[deleted!.idx].children?.findIndex(r => _.isEqual(old, r)) === -1);
      const from = oldSchema[deleted!.idx].children![fromIdx!];
      const to = schema[add.idx].children?.findIndex(r => _.isEqual(r, from));

      if (to === -1 || !to) {
        throw new Error('layout data error when diffing!');
      }

      const fromKeyToPageSchemKey = from.key.split('-')[0];
      const toKeyToPageSchemKey = add?.key.split('-')[0]!;
      const oldComponents = res[fromKeyToPageSchemKey as keyof PageSchema]?.componets!.splice(fromIdx!, 1);
      res[toKeyToPageSchemKey as keyof PageSchema]?.componets?.splice(to, 0, oldComponents![0]);
    } 
    // immutable 同层级变化 或 没有变化
    else {
      let diffResult: SimpleDiffResult = {
        title: '',
        diff: []
      }

      schema.forEach(tree => {
        tree.children?.forEach((tr, idx) => {
          if (tr.key.indexOf(idx.toString()) === -1) {
            const nowIdx = tr.key.match(/\d+/)![0];
            diffResult.title = tree.title;
            diffResult.diff.push({
              idx,
              nowIdx: parseInt(nowIdx)
            })
          }
        })
      })

      // 没有发生变化
      if (diffResult.diff.length === 0) return;

      const { title, diff } = diffResult;

      const components = res[title as keyof PageSchema]?.componets!;
      if (diff[0].idx !== diff[1].nowIdx || diff[1].idx !== diff[0].nowIdx) throw new Error('immutable diff result data error!');

      const from = diff[0].idx;
      const to = diff[0].nowIdx;
      // swap es6
      [components[from], components[to]] = [components[to], components[from]];
    }

    console.log('res: ', res);

    Event.emit<PageSchema>('treeValueChange', res);
  }
  
  layoutDiff = (oldLayout: Tree, layout: Tree): DiffResult => {
    if (oldLayout.key !== layout.key || oldLayout.title !== layout.title) throw new Error('layout diff error!');

    let result: DiffResult = {
      type: 'immutable'
    };
    // 当 children 的长度一致时 进行 children diff
    if (oldLayout.children?.length === layout.children?.length) {
      // this.childrenDiff(oldLayout.children!, layout.children!);
      result.type = 'immutable';
    } else if ((oldLayout.children?.length ?? 0) > (layout.children?.length ?? 0)) {
      result.type = 'delete';
    } else if ((oldLayout.children?.length ?? 0) < (layout.children?.length ?? 0)) {
      result.type = 'add';
    }

    return result;
  }

  onRightClick = (info: any) => {
    console.log('info', info);
  }

  render() {
    return (
      <>
        <Tree
          className="draggable-tree"
          draggable
          blockNode
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
          treeData={this.state.schema as any}
          onDragEnd={this.treeValueHelper}
          defaultExpandParent
          showLine
          onRightClick={this.onRightClick}
        />
        {/* <div className="helper">

        </div> */}
      </>
    );
  }
}