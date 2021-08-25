import { Delete } from "./interactive.base";

export interface IGetSchemaInfoParams {
  schemaId: number;
}

export interface IUpdateSchemaInfoParams {
  schemaId: number;
  schemaPageId?: number;
  schemaContent?: string;
  schemaVersion?: string;
  schemaDelete?: Delete;
}