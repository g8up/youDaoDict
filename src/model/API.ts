import util from '../common/util';
import http from './Http';

enum AddState {
  ADD_DONE = 'adddone',
  NO_USER = 'nouser'
}

type Message = AddState.ADD_DONE | AddState.NO_USER;

interface AddToNoteState {
  message: Message;
}

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
 */
const addWord = (word: string) => http.get(YouDaoAddWordUrl, {
  q: word,
  action: 'addword',
  le: 'eng',
}).then((ret: AddToNoteState) => {
  const msg = ret.message;
  if (msg === AddState.ADD_DONE) {
    return Promise.resolve();
  }
  if (msg === AddState.NO_USER) {
    return Promise.reject();
  }
  return null;
});

const fetchWordOnline = (word: string) => {
  if (word === '') {
    return Promise.reject();
  }
  return http.fetchXML(
    'https://dict.youdao.com/fsearch',
    Object.assign({
      q: word,
      le: util.isContainKoera(word) ? 'ko' : 'eng',
    }, CommonParams),
  );
};


const TranslateUrl = 'http://fanyi.youdao.com/translate';

/**
 * 查询英文之外的语言
 */
const fetchTranslate = (sentence: string) => http.fetchXML(
  TranslateUrl,
  Object.assign({}, CommonParams, {
    i: sentence,
    xmlVersion: '1.1', // 翻译接口要求 1.1
  }));

export const fetchTranslateJson = (sentence: string) => http.get(
  TranslateUrl,
  Object.assign({
    type: 'AUTO',
    doctype: 'json',
    version: '2.1',
    keyfrom: 'fanyi.web',
    ue: 'UTF-8',
    action: 'FY_BY_CLICKBUTTON',
    typoResult: 'true',
  }, {
    i: sentence,
  })
).then(data => {
  const {
    errorCode,
    translateResult: [
      [
        {
          src,
          tgt,
        }
      ]
    ] } = data;
  if (errorCode === 0) {
    return {
      src,
      tgt,
    };
  }
  else {
    const errMsg = '翻译接口异常';

    console.error(errMsg, data);
    throw errMsg;
  }
});

export default {
  addWord,
  fetchWordOnline,
  fetchTranslate,
};
