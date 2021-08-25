import { Provide, Inject, Logger } from '@midwayjs/decorator';
import { FaaSContext } from '@midwayjs/faas';
import { ILogger } from '@midwayjs/logger';
import SchemaMapper from "../mapper/SchemaMapper";
import { Schema } from "../entity/schema";
import Exception from "../exception/exception";

@Provide()
class SchemaService {
  @Logger()
  public static logger: ILogger;
  @Inject()
  private schemaMapper: SchemaMapper;

  public async getSchemaById(schemaId: number): Promise<Schema[]> {
    return await this.schemaMapper.getSchemaById(schemaId);
  }

  public async getSchemaByPageId(pageId: number, pageVersion: string): Promise<Schema[]> {
    return await this.schemaMapper.getSchemaByPageId(pageId, pageVersion);
  }

  public async addSchema(schema: Schema): Promise<Schema> {
    schema.schema_create_time = new Date();

    const addSchemaResult = await this.schemaMapper.addSchema(schema);
    if (!addSchemaResult) throw Exception.innerError();

    return addSchemaResult;
  }

  public async updateSchema(schemaId: number, schema: Schema): Promise<boolean> {
    const origin = await this.schemaMapper.getSchemaById(schemaId);

    if (origin.length === 0) throw Exception.create(Exception.ErrorCode.SCHEMA_NOT_EXITS);
    const originSchema = origin[0];
    const schemaInfo = this.assemble(schema, originSchema);
    schemaInfo.schema_update_time = new Date();

    const updateResult = await this.schemaMapper.updateSchemaBySchemaId(schemaId, schemaInfo);
    if (!(updateResult?.raw?.changeRows > 0)) throw Exception.innerError();

    return true;
  }

  public async deleteSchema(id: number, force: boolean = false): Promise<boolean> {
    const delRes = await (force ?
      this.schemaMapper.hardDeletePageById(id) :
      this.schemaMapper.softDeleteSchemaById(id));

    return delRes.raw > 0;
  }

  private assemble(schema: Schema, origin?: Schema): Schema {
    const schemaDo = new Schema();
    schemaDo.schema_version = schema.schema_version ?? origin?.schema_version;
    schemaDo.schema_page_id = schema.schema_page_id ?? origin?.schema_page_id;
    schemaDo.schema_content = schema.schema_content ?? origin?.schema_content;

    return schemaDo;
  }
}

export default SchemaService;