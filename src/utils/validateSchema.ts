import { message } from "antd";
import { PageSchema, ComponetSchema } from "src/interface/schema";
import { checkComponentExits } from "./factory";
import React from 'react';

const validate = (schema: string): boolean => {
  if (!schema) {
    message.error('please input valid schema!', 1.5);
    return false;
  }

  let obj: PageSchema = {} as PageSchema;
  let res: boolean = true;

  try {
    obj = JSON.parse(schema);
  } catch (_) {
    message.error('schema 解析失败！请修改schema再尝试', 1.5);
  }

  const keys = Object.keys(obj) as [keyof PageSchema];

  keys.forEach(key => {
    const item = obj[key];
    const components = item?.componets;

    res = validateComponentSchema(components);
  })

  return res;
}

const validateComponentSchema = (schema?: ComponetSchema[]): boolean => {
  if (!schema) {
    message.error('can\'t find schema please check!');
    return false;
  }

  let result = true;

  if (schema.length === 0) {
    message.error('can\'t find components please check!');
    return false;
  };

  schema.forEach((i) => {
    if (!checkComponentExits(i.schema.type)) {
      message.error(`type ${i.schema.type} not match in components pool, please check!`);

      result = false;
    } else if (i.style && !validateComponentStyle(i.style)) {
      message.error(`type ${i.style} not valid, please check!`);

      result = false;
    }
  })

  return result;
}

const validateComponentStyle = (style?: React.CSSProperties): boolean => {
  if (!style) return false;

  let res: boolean = true;


  return res;
}

export {
  validate,
  validateComponentSchema,
  validateComponentStyle
}