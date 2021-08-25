import React from "react";

export interface RendererBasicConfig<T> {
  test: RegExp;
  name?: string;
  storeType?: string;
  shouldSyncSuperStore?: (
    store: any,
    props: any,
    prevProps: any
  ) => boolean | undefined;
  storeExtendsData?: boolean; // 是否需要继承上层数据。
  weight?: number; // 权重，值越低越优先命中。
  isolateScope?: boolean;
  isFormItem?: boolean;
  defaultData: T
  // [propName:string]:any;
}

export interface EditorRendererBaseConfig<T = any, R = T> {
  test: RegExp;
  name: string;
  helper:(value: T) => R;
}

export interface EditorRendererConfig<T = any, R = T> extends EditorRendererBaseConfig<T, R> {
  component: React.ComponentType;
}

export interface RendererConfig<T = any> extends RendererBasicConfig<T> {
  component: React.ComponentType;
}

export interface RendererBaseProps {
  cRef?: React.Ref<any>;
  id?: string;
  isPreview?: boolean;
}

export interface RendererProps extends RendererBaseProps {
  style?: React.CSSProperties;
}