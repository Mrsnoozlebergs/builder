import { Result } from 'antd';
import React from 'react';

export default (props: { msg?: string }) => {
  
  return (
    <Result 
      status="500"
      title="500"
      subTitle={props.msg || 'Sorry, something went wrong.'}
    />
  )
}