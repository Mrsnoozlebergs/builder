import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { Schema } from '../entity/schema';
import { Delete } from '../interface/interactive.base';

@Provide()
export default class SchemaMapper {
  @InjectEntityModel('Schema')
  private schemaModel: Repository<Schema>;

  public async addSchema(schema: Schema) {
    return await this.schemaModel.save(schema);
  }

  public async updateSchemaBySchemaId(id: number, schema: Schema) {
    return await this.schemaModel.update(id, schema);
  }

  public async softDeleteSchemaById(id: number[] | number) {
    return await this.schemaModel.update(id, { schema_delete: Delete.true });
  }

  public async hardDeletePageById(id: number | number[]) {
    return await this.schemaModel.delete(id);
  }

  public async getSchemaById(id: number | number[]): Promise<Schema[]> {
    let res: Schema[];
    if (Array.isArray(id)) {
      res = await this.schemaModel.findByIds(id, {
        where: {
          schema_delete: Delete.false
        }
      });
    } else {
      res = await this.schemaModel.find({
        schema_id: id,
        schema_delete: Delete.false
      })
    }

    return res;
  }

  public async getSchemaByPageId(id: number, version?: string): Promise<Schema[]> {
    return version == undefined ? 
      await this.schemaModel.find({
        schema_page_id: id,
        schema_delete: Delete.false,
      }) : 
      await this.schemaModel.find({
        schema_page_id: id,
        schema_delete: Delete.false,
        schema_version: version
      })
  }
}