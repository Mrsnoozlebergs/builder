import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Delete } from '../interface/interactive.base';

@EntityModel('Setting')
export class Setting {
  @PrimaryGeneratedColumn('increment')
  setting_id: number;

  @Column('int')
  setting_page_id: number;

  @Column('int')
  setting_grayscale: 1 | 5 | 10 | 20 | 50 | 100;

  @Column('varchar')
  settings_page_version: string;

  @Column('tinyint')
  setting_delete: Delete;

  @Column('datetime')
  setting_create_time: Date;

  @Column('datetime')
  setting_update_time: Date;
}