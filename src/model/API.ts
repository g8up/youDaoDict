import util from '../common/util';
import http from './Http';

enum AddState {
  ADD_DONE = 'adddone',
  NO_USER = 'nouser'
}

type Message =  AddState.ADD_DONE | AddState.NO_USER;

interface AddToNoteState{
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
  },
).then((ret: AddToNoteState) => {
  const msg = ret.message;
  if (msg === AddState.ADD_DONE) {
    Promise.resolve();
  }
  else if (msg === AddState.NO_USER) {
    Promise.reject();
  }
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

/**
 * 查询英文之外的语言
 */
const fetchTranslate = (word: string) => http.fetchXML(
  'http://fanyi.youdao.com/translate',
  Object.assign({
    i: word,
  }, CommonParams));

export default{
  addWord,
  fetchWordOnline,
  fetchTranslate,
}