import Setting from './util/setting';
import {
  OPTION_STORAGE_ITEM,
} from './config';
import {
  isContainKoera,
  isContainJapanese,
  isContainChinese,
} from './util';
import {
  addWord,
  fetchWordOnline,
  fetchTranslate,
} from './http';
import { table } from './render';

const setting = new Setting();
let Options = null;
setting.get().then((data) => {
  Options = data;
});

/**
 * 将配置更新通知已经打开的 Tab
 */
const publishOptionChangeToTabs = (options) => {
  chrome.tabs.query({
    status: 'complete',
  }, (tabs) => {
    if (tabs.length) {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          optionChanged: options,
        }, () => {
          // console.log('option changed event has been published');
        });
      });
    }
  });
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }
  Object.keys(changes).some((key) => {
    if (key === OPTION_STORAGE_ITEM) {
      const storageChange = changes[key];
      Object.assign(Options, storageChange.newValue);
      console.log(Options);
      publishOptionChangeToTabs(Options);
      return true;
    }
    return false;
  });
});

// 解析返回的查询结果
const translateXML = (xmlnode) => {
  let noBaseTrans = false;
  let noWebTrans = false;
  const translate = '<strong>查询:</strong><br/>';
  const root = xmlnode.getElementsByTagName('yodaodict')[0];

  const retrieveDataMap = {
    phrase: 'return-phrase', // 查询的单词、短语
    speach: 'dictcn-speach', // 发音
    lang: 'lang',
    phonetic: 'phonetic-symbol',
  };
  const params = {};
  Object.keys(retrieveDataMap).forEach((key) => {
    let node = retrieveDataMap[key];
    node = root.getElementsByTagName(node);
    if (node.length) {
      const el = node[0].childNodes[0];
      if (el !== 'undefined') {
        params[key] = el.nodeValue;
      } else {
        params[key] = '';
      }
    }
  });
  const title = params.phrase;

  if (params.phonetic) {
    params.phonetic = `[${params.phonetic}]`;
  }

  let basetrans = '';
  const $translations = root.getElementsByTagName('translation');
  if (!$translations.length) {
    noBaseTrans = true;
  } else if (typeof $translations[0].childNodes[0] === 'undefined') {
    noBaseTrans = true;
  } else {
    for (let i = 0; i < $translations.length; i += 1) {
      const transContVal = $translations[i].getElementsByTagName('content')[0].textContent;
      basetrans += `<div class="ydd-trans-container">${transContVal}</div>`;
    }
  }

  let webtrans = '';
  const $webtranslations = root.getElementsByTagName('web-translation');
  if (!$webtranslations.length) {
    noWebTrans = true;
  } else if (typeof $webtranslations[0].childNodes[0] === 'undefined') {
    noWebTrans = true;
  } else {
    for (let i = 0; i < $webtranslations.length; i += 1) {
      const key = $webtranslations[i].getElementsByTagName('key')[0].childNodes[0].nodeValue;
      const val = $webtranslations[i].getElementsByTagName('trans')[0].getElementsByTagName('value')[0].childNodes[0].nodeValue;
      webtrans += `<div class="ydd-trans-container">
          <a href="http://dict.youdao.com/search?q=${encodeURIComponent(key)}&le=${params.lang}&keyfrom=chrome.extension" target=_blank>${key}:</a>
            ${val}<br />
          </div>`;
    }
  }
  return table(title, params.speach, params.phonetic, noBaseTrans,
    noWebTrans, basetrans, webtrans);
};

let transStrTmp;
let inputStrTmp;
const translateTransXML = (xmlnode) => {
  let s = xmlnode.indexOf('CDATA[');
  let e = xmlnode.indexOf(']]');
  const inputStr = xmlnode.substring(s + 6, e);
  const remain = xmlnode.substring(e + 2, xmlnode.length - 1);
  s = remain.indexOf('CDATA[');
  e = remain.indexOf(']]');
  const transStr = remain.substring(s + 6, e);
  transStrTmp = transStr.trim();
  inputStrTmp = inputStr.trim();
  if ((isContainChinese(inputStrTmp) || isContainJapanese(inputStrTmp)
    || isContainKoera(inputStrTmp)) && inputStrTmp.length > 15) {
    inputStrTmp = `${inputStrTmp.substring(0, 8)} ...`;
  } else if (inputStrTmp.length > 25) {
    inputStrTmp = `${inputStrTmp.substring(0, 15)} ...`;
  }
  if (transStrTmp === inputStrTmp) {
    return null;
  }
  const res = `<div id="yddContainer">
      <div class="yddTop" class="ydd-sp">
        <div class="yddTopBorderlr">
          <a class="ydd-icon" href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(inputStr)}&keyfrom=chrome.extension" target=_blank">有道词典</a>
          <span>${inputStrTmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')}</span>
          <a href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(inputStr)}&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a>
          <a class="ydd-close">&times;</a>
        </div>
      </div>
      <div class="yddMiddle">
        <div class="ydd-trans-wrapper">
          <div class="ydd-trans-container">
            ${transStr.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')}
          </div>
        </div>
      </div>
    </div>`;
  return res;
};

const AUDIO = document.createElement('audio');
const getAudio = (word) => {
  if (AUDIO.title !== word) {
    const audioUrl = `http://dict.youdao.com/speech?audio=${word}`;
    AUDIO.src = audioUrl;
    AUDIO.title = word;
  }
  return AUDIO;
};

const playAudio = (word) => {
  const audio = getAudio(word);
  audio.play();
};

// let YouDaoLoginUrl = "http://account.youdao.com/login";
// let YouDaoLoginUrl = "http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist";
const YouDaoLoginUrl = 'http://dict.youdao.com/wordbook/wordlist';
// 打开登录框
const loginYoudao = () => {
  chrome.tabs.create({
    url: YouDaoLoginUrl,
  }, () => {});
};


const setBadge = (text, color) => {
  chrome.browserAction.setBadgeText({
    text,
  });
  if (color) {
    chrome.browserAction.setBadgeBackgroundColor({
      color,
    });
  }
};

const hideBadge = () => {
  setBadge('', '');
};

const popBadgeTips = (text, color) => {
  setBadge(`${text}`, color);
  setTimeout(hideBadge, 3e3);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {
    action,
    word,
  } = request;
  switch (action) {
    case 'getOption':
      setting.get().then((data) => {
        sendResponse({
          option: data,
        });
      });
      return true;
    case 'select-to-search':
      fetchWordOnline(word).then((ret) => {
        const dataText = translateXML(ret);
        if (dataText != null) {
          sendResponse(dataText);
        }
      });
      return true;
    case 'translate':
      fetchTranslate(word).then((ret) => {
        const dataText = translateTransXML(ret);
        if (dataText != null) {
          sendResponse({
            data: dataText,
          });
        }
      });
      return true;
    case 'speech':
      playAudio(request.word);
      break;
    case 'login-youdao':
      loginYoudao();
      break;
    case 'youdao-add-word':
      addWord(word).then(() => {
        popBadgeTips('OK', 'green');
        sendResponse();
      }, () => {
        loginYoudao();
      });
      return true;
    default:
      sendResponse();
      break;
  }
  return true;
});
