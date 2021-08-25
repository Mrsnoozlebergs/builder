import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Delete } from '../interface/interactive.base';

@EntityModel('Page')
export class Page {
  @PrimaryGeneratedColumn('increment')
  page_id: number;

  @Column('varchar')
  page_user_id: string;

  @Column('varchar')
  page_name: string;

  @Column('longtext')
  page_schema: string;

  @Column('tinyint')
  page_authority: PageAuthority;

  @Column('varchar')
  page_enter_id: string;

  @Column('int')
  page_setting_id: number;

  @Column('varchar')
  page_current_version: string;

  @Column('varchar')
  page_max_version: string;

  @Column('tinyint')
  page_delete: Delete;

  @Column('datetime')
  page_create_time: Date;

  @Column('datetime')
  page_update_time: Date;
}

export enum PageAuthority {
  public,
  private
}