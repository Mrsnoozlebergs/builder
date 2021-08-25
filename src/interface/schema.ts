import React from "react";

export interface PageSchema {
  header?: Layout;
  content: Layout;
  siderLeft?: Layout;
  siderRight?: Layout;
  footer?: Layout;
}

export interface ComponetSchema {
  schema: any;
  style?: React.CSSProperties;
}

export interface Layout {
  title?: string;
  inline?: boolean;
  componets?: ComponetSchema[];
}