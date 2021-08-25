import React, { useEffect, useState } from 'react';
import './editorTool.less';

interface IEditorToolProps {
  add?: () => void;
  delete?: () => void;
  change?: (direction: 'up' | 'down') => void;
  info: IClientInfo;
}

export interface IClientInfo {
  clientWidth: number;
  clientHeight: number;
  offsetLeft: number;
  offsetTop: number;
  schema: any;
}

export default (props: IEditorToolProps) => {
  const [info, setInfo] = useState<IClientInfo>(props.info);

  useEffect(() => {
    setInfo(props.info);
  }, [props.info])

  return (
    <div style={{
      border: '1px solid rgba(66,133,244,.75)',
      position: 'absolute',
      top: info.offsetTop,
      left: info.offsetLeft,
      width: info.clientWidth,
      height: info.clientHeight,
      background: 'rgba(66,133,244,.1)'
    }}>
      <div style={{
        background: '#4285f4',
        left: '-1px',
        top: '-18px',
        position: 'absolute',
        color: '#fff',
        padding: '2px 5px',
        fontSize: '11px',
        borderRadius: '3px 3px 0 0',
        lineHeight: 1.2,
        // display: 'none',
        zIndex: 124,
        whiteSpace: 'nowrap',
        boxShadow: '0 -2px 5px rgb(255 255 255 / 50%)',
      }}>{info.schema.type}</div>
      <div className="button-container">
        <div className="button-container-button" onClick={props.add}>
          <img src={require('src/assets/add.png')} alt='' className="button-container-img"/>
        </div>
        <div className="button-container-button" onClick={() => props.change?.('up')}>
          <img src={require('src/assets/up.png')} alt='' className="button-container-img" />
        </div>
        <div className="button-container-button">
          <img src={require('src/assets/down.png')} onClick={() => props.change?.('down')} alt='' className="button-container-img" />
        </div>
        <div className="button-container-button" onClick={props.delete}>
          <img src={require('src/assets/ashbin.png')} alt='' className="button-container-img" />
        </div>
      </div>
    </div>
  )
}