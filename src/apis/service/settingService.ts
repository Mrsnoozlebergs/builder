import { Inject, Provide, Logger } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import SettingMapper from "../mapper/settingMapper";
import { Setting } from "../entity/setting";

@Provide()
class SettingService {
  @Logger()
  private logger: ILogger;
  @Inject()
  private settingMapper: SettingMapper;

  public async addSetting(setting: Setting): Promise<Setting> {
    this.logger.info(`SettingService.addSetting ===== ${setting.setting_page_id} add setting with version ${setting.settings_page_version}`);
    return await this.settingMapper.addSetting(setting);
  }

  public async updateSetting(settingId: number, setting: Setting): Promise<boolean> {
    const settingDo = this.assemble(setting);
    settingDo.setting_update_time = new Date();
    this.logger.info(`SettingService.updateSetting ===== ${setting.setting_page_id} update setting`);
    const updateResult = await this.settingMapper.updateSettingById(settingId, settingDo);

    return updateResult?.raw?.changeRows > 0;
  }

  public async getSettingById(settingId: number): Promise<Setting[]> {
    this.logger.info(`SettingService.getSettingById ===== get ${settingId} \'s setting`);
    return await this.settingMapper.getSettingById(settingId);
  }

  public async getSettingByPageId(pageId: number): Promise<Setting[]> {
    this.logger.info(`SettingService.getSettingByPageId ===== get ${pageId} \'s setting`);
    return await this.settingMapper.getSettingByPageId(pageId);
  }

  public async deleteSetting(id: number, force: boolean = false): Promise<boolean> {
    const delRes = await (!force ? this.settingMapper.softDeleteSettingById(id) : this.settingMapper.hardDeleteSettingById(id));

    return delRes.raw > 1;
  }

  private assemble(setting: Setting, origin?: Setting): Setting {
    const settingDo = new Setting();
    settingDo.setting_page_id = setting.setting_page_id ?? origin?.setting_page_id;
    settingDo.setting_grayscale = setting.setting_grayscale ?? origin?.setting_grayscale;
    settingDo.settings_page_version = setting.settings_page_version ?? origin?.settings_page_version;

    return settingDo;
  }
}

export default SettingService;
