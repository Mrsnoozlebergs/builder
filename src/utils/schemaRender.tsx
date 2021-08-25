import _ from 'lodash';
import React from 'react';
import { getComponent } from './factory';

export interface SchemaRendererProps {
  schema: string;
  $path: string;
  preview?: boolean;
  click?: (cur: any, schema: any, id: string, $path: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  online?: boolean;
  boxStyle?: React.CSSProperties;
}

interface SchemaRendererState {

}

// 递增id
let id = 0;

export default class SchemaRender extends React.Component<SchemaRendererProps, SchemaRendererState> {
  static displayName: string = 'Renderer';
  ref: any;
  proxy: any;
  divRef: any;

  constructor(props: SchemaRendererProps) {
    super(props);
    this.ref = React.createRef();
    this.divRef = React.createRef();
  }

  shouldComponentUpdate(nextProps: SchemaRendererProps) {
    return !_.isEqual(this.props, nextProps);
  }

  resolveRenderer(schema: any) {
    const renderer = getComponent(schema?.type);

    return renderer;
  }

  componentDidUpdate(prevProps: SchemaRendererProps) {
    const { preview } = this.props;
    if (!preview && prevProps.preview === preview) {
      setTimeout(() => {
        this.divRef?.current?.click();
      }, 500)
    }
  }

  render() {
    const { schema, $path, preview = true, online = false, boxStyle } = this.props;
    const { component: Custom, defaultData } = this.resolveRenderer(schema);

    const renderProps = Object.assign(_.cloneDeep(defaultData), schema, { style: boxStyle, isPreview: preview });
    const idx = (++id).toString();

    return (
      <>
        {
          !preview && !online ? 
          (
            <div ref={this.divRef} onClick={(e) => this.props.click?.(this.ref?.current, renderProps, idx, $path, e)}>
              <Custom id={idx} {...renderProps} cRef={this.ref} />
            </div>
          ) : <Custom {...renderProps} cRef={this.ref} />
        }
      </>
    )
  }
}