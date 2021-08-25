import { Inject, Provide } from '@midwayjs/decorator';
import PageMapper from "../mapper/PageMapper";
import SettingService from "./settingService";
import SchemaService from "./schemaService";
import { Page } from "../entity/page";
import { PageDTO } from "../interface/page";
import Exception from "../exception/exception";
import { parseUid } from "../utils/uint";
import * as uuid from 'uuid';

@Provide()
class PageService {
  @Inject()
  pageMapper: PageMapper;
  @Inject()
  settingService: SettingService;
  @Inject()
  schemaService: SchemaService;

  public async publishPage(page: PageDTO, userId: string): Promise<PageDTO> {
    const { schema, setting } = page;
    const pageDo = this.assemble(page);
    const now = new Date();
    pageDo.page_user_id = userId;
    pageDo.page_enter_id = uuid.v1();
    pageDo.page_create_time = now;
    pageDo.page_max_version = page.page_max_version ?? page.page_current_version;

    // add schema
    let addSchemaResult;
    if (schema && schema.length > 0) {
      addSchemaResult = await this.schemaService.addSchema(schema[0]);
      if (!addSchemaResult) throw Exception.innerError();
    }
    // add setting
    let addSettingResult;
    if (setting && setting.length > 0) {
      addSettingResult = await this.settingService.addSetting(setting[0]);
      if (!addSettingResult) {
        addSchemaResult && await this.schemaService.deleteSchema(addSchemaResult.schema_id, true);
        throw Exception.innerError()
      } else {
        pageDo.page_setting_id = addSettingResult.setting_page_id;
      }
    }

    // add page
    const addPageResult = await this.pageMapper.addPage(pageDo);
    if (!addPageResult) {
      // page 插入失败
      addSchemaResult && await this.schemaService.deleteSchema(addSchemaResult.schema_id, true);
      addSettingResult && await this.settingService.deleteSetting(addSettingResult.setting_id, true);
    }

    return addPageResult;
  }

  public async getAllPage(userId: string): Promise<Page[]> {
    return await this.pageMapper.getPageByUserId(userId);
  }

  public async getPageByPageEnterId(enterId: string, uid: string): Promise<PageDTO> {
    const pageDo = await this.pageMapper.getPageByEnterId(enterId);
    if (pageDo.length === 0) throw Exception.create(Exception.ErrorCode.PAGE_NOT_EXITS);

    const {page_id, page_setting_id, page_current_version} = pageDo[0];
    let settingDo = null;
    let pageVersion = page_current_version;

    if (page_setting_id) {
      settingDo = await this.settingService.getSettingById(page_setting_id);
    }

    if (settingDo && settingDo.length > 0) {
      const settings = settingDo[0];
      // 灰度命中
      if (parseUid(uid) < settings.setting_grayscale) {
        pageVersion = settings.settings_page_version;
      }
    }

    const schemaDo = await this.schemaService.getSchemaByPageId(page_id, pageVersion);

    return {...pageDo[0], schema: schemaDo};
  }

  public async getPageByPageId(pageId: number): Promise<PageDTO> {
    const pageDo = await this.pageMapper.getPageById(pageId);
    if (pageDo.length === 0) throw Exception.create(Exception.ErrorCode.PAGE_NOT_EXITS);
    // schema
    const schemaDo = await this.schemaService.getSchemaByPageId(pageId, pageDo[0].page_current_version);
    // settings
    const settingDo = await this.settingService.getSettingByPageId(pageId);
    return {
      ...pageDo[0],
      schema: schemaDo,
      setting: settingDo
    }
  }

  public async updatePage(page: PageDTO): Promise<boolean> {
    const { page_id } = page;
    const pageDos = await this.pageMapper.getPageById(page_id);

    if (pageDos.length === 0) throw Exception.create(Exception.ErrorCode.PAGE_NOT_EXITS);
    const pageDo = pageDos[0];

    const pageDoo = this.assemble(page, pageDo);
    pageDoo.page_update_time = new Date();

    const updateResult = await this.pageMapper.updatePageById(page_id, pageDoo);

    return updateResult?.raw?.changeRows > 0;
  }

  public async deletePage(pageId: number | number[], force: boolean = false): Promise<boolean> {
    const delRes = await (
      force ?
        this.pageMapper.hardDeletePageById(pageId) :
        this.pageMapper.softDeletePageById(pageId)
    );

    return delRes.raw > 0;
  }

  private assemble(target: PageDTO, origin?: Page): Page {
    const page = new Page();
    page.page_name = target.page_name ?? origin?.page_name;
    page.page_authority = target.page_authority ?? origin?.page_authority;
    page.page_current_version = target.page_current_version ?? origin?.page_current_version;
    page.page_max_version = target.page_max_version ?? origin?.page_max_version;
    page.page_setting_id = target.page_setting_id ?? origin?.page_setting_id;

    return page;
  }
}

export default PageService;