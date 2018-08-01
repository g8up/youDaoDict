import {
	isContainKoera,
	ajax,
} from './util';

const YouDaoAddWordUrl = 'http://dict.youdao.com/wordbook/ajax';
/**
 * 添加到单词本
 * @param {String} word
 */
export const addWord = (word) => {
  return ajax({
		url: YouDaoAddWordUrl,
		data:{
			action: 'addword',
			le: 'eng',
			q: word,
		},
		dataType: 'json',
	}).then((ret) => {
    let msg = ret.message;
    if (msg === "adddone") {
      Promise.resolve();
    }
    else if (msg === 'nouser') {
      Promise.reject();
    }
  });
};

export const fetchWordOnline = (word) =>{
  if( word === ''){
    return Promise.reject();
  }
	return ajax({
		url: 'http://dict.youdao.com/fsearch',
		dataType: 'xml',
		data: {
			client: 'deskdict',
			keyfrom: 'chrome.extension',
			xmlVersion: '3.2',
			dogVersion: '1.0',
			ue: 'utf8',
			q: word,
			doctype: 'xml',
			pos: '-1',
			vendor: 'unknown',
			appVer: '3.1.17.4208',
			le: isContainKoera(word) ? 'ko' : 'eng'
		},
	});
};

/**
 * 查询英文之外的语言
 * @param {String} words
 * @param {Function} callback
 */
export const fetchTranslate = (words, callback) =>{
	return ajax({
		url: 'http://fanyi.youdao.com/translate',
		data:{
			client: 'deskdict',
			keyfrom: 'chrome.extension',
			xmlVersion: '1.1',
			dogVersion: '1.0',
			ue: 'utf8',
			i: words,
			doctype: 'xml'
		},
		dataType: 'xml',
	});
};