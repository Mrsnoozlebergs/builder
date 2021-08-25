import React from 'react';
import { Form, FormInstance } from 'antd';
import { getEditorConponent, getEditorHelper } from '../factory';
import Event from '../Event';
import _ from 'lodash';

export interface IEditorProps {
  schema: any;
  $path: string;
}

export interface BaseEditorProps { 
  form: ReturnType<typeof Form.useForm>[0]
  $path: string;
};

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const func = (value: any) => value;

export default class BaseEditor extends React.Component<IEditorProps, any>  {
  ref = React.createRef<FormInstance>();
  form: FormInstance;

  editorValueChange = _.debounce((changeValues: any, allValues: any )=> {
    const customHelper = getEditorHelper(this.props.schema.type) || func;
    Event.emit<any>('editorValueChange', customHelper(allValues));
  }, 500);

  render() {
    const { schema, $path } = this.props;

    if (!schema) return null;

    const editorConfig = getEditorConponent(schema.type);
    if (editorConfig === null) return null;

    const EditorComponent = editorConfig.component;

    return (
      <Form key={$path} ref={this.ref} form={this.form} {...layout} onValuesChange={this.editorValueChange}>
        <EditorComponent
          {...schema}
          form={this.form}
          $path={$path}
        />
      </Form>
    )
  }
}