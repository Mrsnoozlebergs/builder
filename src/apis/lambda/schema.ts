import { useInject } from "@midwayjs/hooks";
import { Schema } from "../entity/schema";
import Exception from "../exception/exception";
import { ErrorCode } from "../interface/res";
import { IGetSchemaInfoParams, IUpdateSchemaInfoParams } from "../interface/schema";
import SchemaMapper from "../mapper/SchemaMapper";
import Response from "../utils/response";

export async function getSchemaInfo(params: IGetSchemaInfoParams): Promise<Response<Schema>> {
  const { schemaId } = params;
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);
  const schemaFromSql = await schemaMapper.getSchemaById(schemaId);

  if (!(schemaFromSql.length >= 0)) throw Exception.innerError();

  return Response.success<Schema>('获取成功!', schemaFromSql[0]);
}

export async function updateSchemaInfo(params: IUpdateSchemaInfoParams): Promise<Response<null>> {
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);
  const { schemaId, schemaPageId, schemaContent, schemaDelete, schemaVersion } = params;
  const schemaFromSql = await schemaMapper.getSchemaById(schemaId);

  if (!(schemaFromSql.length > 0)) throw Exception.create(ErrorCode.SCHEMA_NOT_EXITS);
  const itemFromSql = schemaFromSql[0];
  const schema = new Schema();
  schema.schema_page_id = schemaPageId ?? itemFromSql.schema_page_id;
  schema.schema_content = schemaContent ?? itemFromSql.schema_content;
  schema.schema_version = schemaVersion ?? itemFromSql.schema_version;
  schema.schema_delete = schemaDelete ?? itemFromSql.schema_delete;
  schema.schema_update_time = new Date();

  const updateResult = await schemaMapper.updateSchemaBySchemaId(schemaId, schema);

  if (!(updateResult?.raw?.changedRows > 0)) throw Exception.innerError();

  return Response.success<null>('更新成功!');
}

export async function deleteSchema(id: number, force: boolean = false): Promise<Response<null>> {
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);

  const del = force ? schemaMapper.hardDeletePageById(id) : schemaMapper.softDeleteSchemaById(id);

  const delRes = await del;

  if (!(delRes.raw > 0)) throw Exception.innerError();

  return Response.success<null>('删除成功!');
}