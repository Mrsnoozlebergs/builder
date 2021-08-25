import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { Setting } from '../entity/setting';
import { Delete } from '../interface/interactive.base';

@Provide()
export default class SettingMapper {
  @InjectEntityModel('Setting')
  private settingModel: Repository<Setting>;

  public async addSetting(setting: Setting) {
    return await this.settingModel.save(setting);
  }

  public async updateSettingById(id: number, setting: Setting) {
    return await this.settingModel.update(id, setting);
  }

  public async softDeleteSettingById(id: number[] | number) {
    return await this.settingModel.update(id, { setting_delete: Delete.true });
  }

  public async hardDeleteSettingById(id: number | number[]) {
    return await this.settingModel.delete(id);
  }

  public async getSettingById(id: number | number[]): Promise<Setting[]> {
    let res: Setting[];
    if (Array.isArray(id)) {
      res = await this.settingModel.findByIds(id, {
        where: {
          setting_delete: Delete.false
        }
      });
    } else {
      res = await this.settingModel.find({
        setting_id: id,
        setting_delete: Delete.false
      });
    }

    return res;
  }

  public async getSettingByPageId(id: number): Promise<Setting[]> {
    return await this.settingModel.find({
      setting_page_id: id,
      setting_delete: Delete.false
    })
  }
}