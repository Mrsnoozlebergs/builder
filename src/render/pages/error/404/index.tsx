import React from 'react';
import { Result } from 'antd';

export default (props: { msg?: string }) => {
  
  return (
    <Result 
      status="404"
      title="404"
      subTitle={props.msg || "Sorry, the page you visited does not exist."}
    />
  )
}