/**
 * 按页计划学习
 */

import {
  IPlan, IWord,
} from '../../types';
import History from 'Model/History';
import Base from './Base';

const KEY_REMIND_INDEX = 'REMIND-INDEX';
const KEY_REMIND_PAGE_NUM = 'REMIND-PAGE-NUM';

export default class extends Base implements IPlan {
  pageNum = 1;
  pageSize = 15;
  list:IWord[] = [];
  totalPage = 0;

  index = Math.min(+localStorage.getItem(KEY_REMIND_INDEX) || 0, this.pageSize);

  constructor() {
    super();
  }

  async getOne(): Promise<IWord> {
    await this.initList();

    const word = await super.checkBlank(this.list[this.index++]);
    this.checkForRefreshList();
    localStorage.setItem(KEY_REMIND_INDEX, `${this.index}`);
    return word;
  }

  async initList(){
    if( this.list.length < 1) {
      await this.getPageData({
        pageNum: +localStorage.getItem(KEY_REMIND_PAGE_NUM) || 1,
      });
    }
  }

  /**
   * 获取一页数据
   */
  async getPageData({
    pageNum,
  } = {
    pageNum: this.pageNum,
  }) {
    const {
      list,
      totalPage,
    } = await History.getPage({
      pageNum,
      pageSize: this.pageSize,
    });

    this.pageNum = pageNum;
    this.list = list || [];
    this.totalPage = totalPage;

    console.log( 'list', list);

    localStorage.setItem(KEY_REMIND_PAGE_NUM, `${this.pageNum}`);
  }

  checkForRefreshList() {
    if (this.index >= this.pageSize) {
      if( this.pageNum >= this.totalPage ) {
        this.pageNum = 0;
      }
      // this.getPageData({
      //   pageNum: this.pageNum + 1,
      // });
      this.index = 0; // 重置到起始
      this.getPageData(); // 刷新一次列表，以同步列表的更新
    }
  }
}