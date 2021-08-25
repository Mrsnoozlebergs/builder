import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { Page } from "../entity/page";
import { Delete } from "../interface/interactive.base";

@Provide()
export default class PageMapper {
  @InjectEntityModel('Page')
  private pageModel: Repository<Page>;

  public async addPage(page: Page) {
    return await this.pageModel.save(page);
  }

  public async updatePageById(id: number, page: Page) {
    return await this.pageModel.update(id, page);
  }

  public async softDeletePageById(id: number[] | number) {
    return await this.pageModel.update(id, { page_delete: Delete.true });
  }

  public async hardDeletePageById(id: number | number[]) {
    return await this.pageModel.delete(id);
  }

  public async getPageById(id: number | number[]): Promise<Page[]> {
    let res: Page[];
    if (Array.isArray(id)) {
      res = await this.pageModel.findByIds(id, {
        where: {
          page_delete: Delete.false
        }
      });
    } else {
      res = await this.pageModel.find({
        page_id: id,
        page_delete: Delete.false
      });
    }

    return res;
  }

  public async getPageByEnterId(enterId: string): Promise<Page[]> {
    return await this.pageModel.find({
      page_enter_id: enterId,
      page_delete: Delete.false
    })
  }

  public async getPageByUserId(userId: string): Promise<Page[]> {
    return await this.pageModel.find({
      page_user_id: userId,
      page_delete: Delete.false
    })
  }

}