import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Delete } from '../interface/interactive.base';

@EntityModel('Schema')
export class Schema {
  @PrimaryGeneratedColumn('increment')
  schema_id: number;

  @Column('int')
  schema_page_id: number;

  @Column('longtext')
  schema_content: string;

  @Column('varchar')
  schema_version: string;

  @Column('tinyint')
  schema_delete: Delete;

  @Column('datetime')
  schema_create_time: Date;

  @Column('datetime')
  schema_update_time: Date;
}