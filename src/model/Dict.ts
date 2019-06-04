/**
 * 单词本
 */

export default class Dict {
  api;

  constructor(api){
    this.api = api;
  }

  add(word) {
    return this.api.addWord(word);
  }
}
