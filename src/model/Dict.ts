/**
 * 单词本
 */

export default class Dict {
  http;

  constructor(http){
    this.http = http;
  }

  add(word) {
    return this.http.addWord(word);
  }
}
