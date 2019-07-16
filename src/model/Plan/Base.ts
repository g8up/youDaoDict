import {
  queryAndRecord,
} from '../../common/query';

export default class{
  /**
   * 检查单词翻译是否为空
   */
  async checkBlank(wordEntry) {
    let {
      word,
      lastView,
    } = wordEntry;

    if (!lastView) {
      const full = await queryAndRecord(word);
      Object.assign(wordEntry, full);
    }

    return wordEntry;
  }
}