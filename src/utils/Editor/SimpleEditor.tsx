import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import typeUtils from 'src/utils/type';
import Event from 'src/utils/Event';
import { message } from 'antd';
import _ from 'lodash'

import './SimpleEditor.less';
import { PageSchema } from 'src/interface/schema';

export interface ISimpleEditorProps {
  schema: PageSchema;
  $path: string;
}

export type BoxType = 'margin' | 'padding' | 'border' | 'self';
export type Direction = 'top' | 'left' | 'right' | 'bottom';

export interface IBoxValue {
  type: BoxType;
  direction: Direction;
  value: string;
}

let func: Function | null = null;

export default (props: ISimpleEditorProps) => {
  const [boxStyle, setBoxStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLFormElement>(null);

  const handlePath = () => {
    const { $path } = props;
    const paths = $path.split('/');

    return paths;
  }

  useEffect(() => {
    const { schema } = props;
    const curPaths = handlePath();
    // 获取form dom实例 清空之前的数据
    if (ref.current) {
      console.log('observer $path or schema change reset form value');
      ref.current.reset();
    }
    const idx = curPaths.splice(0, 1)[0];
    const componentIdx = curPaths.splice(curPaths.length - 1, 1)[0];

    let style: React.CSSProperties = {};

    curPaths.forEach(item => {
      style = schema[idx as keyof PageSchema]?.componets?.find((component: any, index: number) => (component.schema.type === item && index === parseInt(componentIdx)))?.style || {};
    })

    setBoxStyle(style);
  }, [props.schema, props.$path])

  const valueChange: React.FormEventHandler<HTMLFormElement> = (v) => {
    v.persist();

    let func = _.debounce(() => {
      const { target } = v;

      if (!target) return;

      if (typeUtils.getIsType<HTMLInputElement>('HTMLInputElement')(target)) {
        const title = target.classList[1];
        const direction = target.classList[0].split('-')[1];
        if (!title || !direction) return;

        const value = target.value;
        if (!value) return;
        if (isNaN(parseFloat(value))) return message.error('请输入合法的数字!');

        const sendValue: IBoxValue = {
          type: title as BoxType,
          direction: direction as Direction,
          value
        }
        
        Event.emit<IBoxValue>('boxValueChange',sendValue);
      }
    }, 1000);
    

    func();
  }

  return (
    <>
      {
        !props.schema || !props.$path || props.$path === 'root' ? null :
        (
          <div className="box-container">
            <form onChange={valueChange} ref={ref}>
              <Box title="margin" boxStyle={boxStyle} />
              <Box title="border" boxStyle={boxStyle} />
              <Box title="padding" boxStyle={boxStyle} />
              <div className="box box-self">
                <input className="box-left self" placeholder="-" defaultValue={boxStyle.width?.toString().replace('px', '') ?? ''} />
                <span className="box-x">x</span>
                <input className="box-right self" placeholder="-" defaultValue={boxStyle.height?.toString().replace('px', '') ?? ''} />
              </div>
            </form>
          </div>
        )
      }
    </>
  )
}

const Box = ({ title, boxStyle }: { title: string, boxStyle: React.CSSProperties }) => {


  return (
    <div className={`box box-${title}`}>
      <span className="box-label">{title}</span>
      <input className={`box-top ${title}`} placeholder="-" defaultValue={boxStyle[`${title}Top` as keyof CSSProperties]?.toString().replace('px', '') ?? ''} />
      <input className={`box-left ${title}`} placeholder="-" defaultValue={boxStyle[`${title}Left` as keyof CSSProperties]?.toString().replace('px', '') ?? ''} />
      <input className={`box-right ${title}`} placeholder="-" defaultValue={boxStyle[`${title}Right` as keyof CSSProperties]?.toString().replace('px', '') ?? ''} />
      <input className={`box-bottom ${title}`} placeholder="-" defaultValue={boxStyle[`${title}Bottom` as keyof CSSProperties]?.toString().replace('px', '') ?? ''} />
    </div>
  )
}