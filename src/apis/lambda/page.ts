import { useContext, useInject } from '@midwayjs/hooks';
import { Page } from '../entity/page';
import Exception from '../exception/exception';
import { IDeletePageParams, IPublishPageParams, IUpdatePageParams } from '../interface/page';
import { UserDTO } from '../interface/user';
import PageMapper from '../mapper/PageMapper';
import Response from '../utils/response';
import * as uuid from 'uuid';
import { ErrorCode } from '../interface/res';
import SchemaMapper from '../mapper/SchemaMapper';
import { Schema } from '../entity/schema';
import SettingMapper from '../mapper/settingMapper';
import { Setting } from '../entity/setting';
import { parseUid } from '../utils/uint';
import pageServcie from "../service/pageServcie";
import PageService from "../service/pageServcie";

export async function publishPage(params: IPublishPageParams): Promise<Response<Page>> {
  const pageMapper = await useInject<PageMapper>(PageMapper);
  const settingMapper = await useInject<SettingMapper>(SettingMapper);
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);
  const ctx = useContext();
  const { isPrivate, schema, setting, pageName = '测试页面', maxVersion, currentVersion } = params;

  const userInfo = JSON.parse(ctx.userInfo) as UserDTO;

  const page = new Page();
  const now = new Date();
  page.page_name = pageName;
  // @deprecate
  // page.page_schema = schema;
  page.page_user_id = userInfo.userId!;
  page.page_enter_id = uuid.v1();
  page.page_authority = isPrivate;
  page.page_create_time = now;
  page.page_current_version = currentVersion;
  page.page_max_version = maxVersion || currentVersion;

  const addResult = await pageMapper.addPage(page);

  if (!addResult) throw Exception.innerError();

  // add schema
  const schemaInfo = new Schema();
  schemaInfo.schema_content = schema;
  schemaInfo.schema_page_id = addResult.page_id;
  schemaInfo.schema_version = currentVersion;
  const addSchemaResult = await schemaMapper.addSchema(schemaInfo);

  if (!addSchemaResult) throw Exception.innerError();

  // 灰度配置
  if (setting) {
    // setting 配置生成
    const settingInfo = new Setting();
    settingInfo.setting_create_time = now;
    settingInfo.setting_page_id = addResult.page_id;
    settingInfo.setting_grayscale = setting.grayScale;
    settingInfo.settings_page_version = setting.pageVersion;

    const addSettingResult = settingMapper.addSetting(settingInfo);

    if (!addSettingResult) throw Exception.innerError();
  }

  return Response.success<Page>('发布成功!', addResult);
}

export async function getAllPage(): Promise<Response<Array<Page>>> {
  const pageMapper = await useInject<PageMapper>(PageMapper);
  const context = useContext();
  const userInfo = JSON.parse(context.userInfo) as UserDTO;

  const pagesFromSql = await pageMapper.getPageByUserId(userInfo.userId!);

  return Response.success<Array<Page>>('获取页面成功', pagesFromSql);
}

export async function getPageByPageEnterId(enterId: string): Promise<Response<Page & { schema: Schema[] }>> {
  const pageMapper = await useInject<PageMapper>(PageMapper);
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);
  const settingMapper = await useInject<SettingMapper>(SettingMapper);
  const ctx = useContext();

  const pageFromSql = await pageMapper.getPageByEnterId(enterId);

  if (pageFromSql.length <= 0) throw Exception.create(ErrorCode.PAGE_NOT_EXITS);

  const { page_id, page_setting_id, page_current_version } = pageFromSql[0];

  let settingFromSql = null;
  let pageVersion = page_current_version;

  if (page_setting_id) {
    settingFromSql = await settingMapper.getSettingById(page_setting_id);
  }

  if (settingFromSql && settingFromSql.length > 0) {
    const settings = settingFromSql[0];
    // 灰度命中
    if (parseUid(ctx.uid) < settings.setting_grayscale) {
      pageVersion = settings.settings_page_version;
    }
  }

  const schema = await schemaMapper.getSchemaByPageId(page_id, pageVersion);

  return Response.success<Page & { schema: Schema[] }>('获取配置成功!', { ...pageFromSql[0], schema });
}

export async function getPageByPageId(pageId: number): Promise<Response<Page & { schema: Schema[], settings?: Setting[] }>> {
  const pageMapper = await useInject<PageMapper>(PageMapper);
  const schemaMapper = await useInject<SchemaMapper>(SchemaMapper);
  const settingMapper = await useInject<SettingMapper>(SettingMapper);
  const pageFromSql = await pageMapper.getPageById(pageId);

  if (pageFromSql.length <= 0) throw Exception.create(ErrorCode.PAGE_NOT_EXITS);
  // schema
  const schema = await schemaMapper.getSchemaByPageId(pageId);
  // setting
  const settings = await settingMapper.getSettingByPageId(pageId);

  return Response.success<Page & { schema: Schema[], settings?: Setting[] }>('获取配置成功!', { ...pageFromSql[0], schema, settings });
}

export async function updatePage(params: IUpdatePageParams): Promise<Response<null>> {
  const { pageName, pageId, isPrivate, schema, pageCurrentVersion, pageMaxVersion, setting } = params;
  const pageMapper = await useInject<PageMapper>(PageMapper);
  const pageFromSql = await pageMapper.getPageById(pageId);

  if (pageFromSql.length === 0) throw Exception.create(ErrorCode.PAGE_NOT_EXITS);

  const sqlItem = pageFromSql[0];

  const page = new Page();
  page.page_name = pageName ?? sqlItem.page_name;
  // @deprecate
  // page.page_schema = schema ?? sqlItem.page_schema;
  page.page_authority = isPrivate ?? sqlItem.page_authority;
  page.page_current_version = pageCurrentVersion ?? sqlItem.page_current_version;
  page.page_max_version = pageMaxVersion ?? sqlItem.page_max_version;
  page.page_update_time = new Date();

  const updateResult = await pageMapper.updatePageById(pageId, page);

  if (!(updateResult?.raw?.changedRows > 0)) throw Exception.innerError();

  return Response.success<null>('更新成功');
}

export async function deletePage(params: IDeletePageParams): Promise<Response<boolean>> {
  const pageService = await useInject<PageService>(PageService);
  const { pageId } = params;

  const delRes = await pageService.deletePage(pageId);

  return delRes ?
    Response.success<boolean>('删除成功') :
    Response.failure(Exception.create(Exception.ErrorCode.DELETE_FAILED));
}
