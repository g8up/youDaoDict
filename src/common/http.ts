import {
  AddState,
  AddToNoteState,
} from './index';
import {
  isContainKoera,
  ajax,
} from './util';

const CommonParams = {
  client: 'deskdict',
  keyfrom: 'chrome.extension',
  xmlVersion: '3.2',
  dogVersion: '1.0',
  ue: 'utf8',
  doctype: 'xml',
  pos: '-1',
  vendor: 'getcrx.cn',
  appVer: '3.1.17.4208',
};

const YouDaoAddWordUrl = 'https://dict.youdao.com/wordbook/ajax';
/**
 * 添加到单词本
 * @param {String} word
 */
export const addWord = word => ajax({
  url: YouDaoAddWordUrl,
  data: {
    q: word,
    action: 'addword',
    le: 'eng',
  },
  dataType: 'json',
}).then((ret: AddToNoteState) => { // eslint-disable-line
  const msg = ret.message;
  if (msg === AddState.adddone) {
    return Promise.resolve();
  }
  if (msg === AddState.nouser) {
    return Promise.reject();
  }
});

export const fetchWordOnline = (word) => {
  if (word === '') {
    return Promise.reject();
  }
  return ajax({
    url: 'https://dict.youdao.com/fsearch',
    dataType: 'xml',
    data: Object.assign({
      q: word,
      le: isContainKoera(word) ? 'ko' : 'eng',
    }, CommonParams),
  });
};

/**
 * 查询英文之外的语言
 * @param {String} words
 */
export const fetchTranslate = words => ajax({
  url: 'http://fanyi.youdao.com/translate',
  data: Object.assign({
    i: words,
  }, CommonParams),
  dataType: 'xml',
});
