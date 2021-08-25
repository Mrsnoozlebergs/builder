import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Delete } from "../interface/interactive.base";

@EntityModel('User')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('varchar')
  user_id: string;

  @Column('int')
  user_hash: number;

  @Column('varchar')
  user_name: string;

  @Column('varchar')
  user_phone: string;

  @Column('varchar')
  user_password: string;

  @Column('tinyint')
  user_authority: UserAuthority;

  @Column('tinyint')
  user_delete: Delete;

  @Column('datetime')
  user_create_time: Date;

  @Column('datetime')
  user_update_time: Date;
}

export enum UserAuthority {
  admin,
  user,
  guest
}
