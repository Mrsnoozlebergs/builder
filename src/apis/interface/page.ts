import { Page, PageAuthority } from "../entity/page";
import { IBaseParams } from "./interactive.base";
import { Schema } from "../entity/schema";
import { Setting } from "../entity/setting";

type IGrayScale = 1 | 5 | 10 | 20 | 50 | 100;
export interface IPublishPageParams {
  pageName?: string;
  schema: string;
  isPrivate: PageAuthority;
  currentVersion: string;
  maxVersion?: string;
  setting?: {
    grayScale: IGrayScale;
    pageVersion: string;
  }
}

export interface IUpdatePageParams {
  pageId: number;
  pageName?: string;
  schema?: string;
  isPrivate?: PageAuthority;
  pageCurrentVersion?: string;
  pageMaxVersion?: string;
  setting?: {
    grayScale: IGrayScale;
  }
}

export interface IDeletePageParams {
  pageId: number | number[];
}

export interface PageDTO extends Page {
  schema?: Schema[];
  setting?: Setting[]
}