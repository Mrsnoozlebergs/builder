import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { User } from "../entity/user";
import { Delete } from "../interface/interactive.base";

@Provide()
export default class UserMapper {

  @InjectEntityModel('User')
  private userModel: Repository<User>;

  public async addUser(user: User) {
    return await this.userModel.save(user);
  }

  public async updateUserById(id: string, user: User) {
    return await this.userModel.update(id, user);
  }

  public async softDeleteUserById(id: string[] | string) {
    return await this.userModel.update(id, { user_delete: Delete.true });
  }

  public async hardDeletedUserById(id: string | string[]) {
    return await this.userModel.delete(id);
  }

  public async getUserById(id: string | string[]): Promise<User[]> {
    let res: User[];
    if (Array.isArray(id)) {
      res = await this.userModel.findByIds(id);
    } else {
      res = await this.userModel.find({
        user_id: id,
        user_delete: Delete.false
      })
    }

    return res;
  }

  public async getUserByPhone(phone: string): Promise<User[]> {
    // const sql = `
    //     SELECT * FROM User
    //     WHERE user_phone = ${phone}
    //     AND user_delete = ${Delete.false}
    // `
    // return await this.userModel.query(sql);

    return await this.userModel.find({
      user_phone: phone,
      user_delete: Delete.false
    })
  }

  public async getUserByUserName(userName: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      user_name: userName,
      user_delete: Delete.false
    });
  }
}
