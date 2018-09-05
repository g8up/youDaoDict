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
import Render from './render';

const setting = new Setting();
let Options = null;
setting.get().then(data => {
  Options = data;
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }
  for (let key in changes) {
    if (key === OPTION_STORAGE_ITEM) {
      let storageChange = changes[key];
      Object.assign(Options, storageChange.newValue);
      console.log(Options);
      publishOptionChangeToTabs(Options);
      break;
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {
    action
  } = request;
  switch (action) {
    case 'getOption':
      setting.get().then(data => {
        sendResponse({
          option: data
        });
      });
      return true;
      break;
    case 'select-to-search':
      fetchWordOnline(request.word).then(ret => {
        const dataText = translateXML(ret);
        if (dataText != null) {
          sendResponse(dataText);
        }
      });
      return true;
      break;
    case 'translate':
      fetchTranslate(request.word).then(ret => {
        let dataText = translateTransXML(ret);
        if (dataText != null) {
          sendResponse({
            data: dataText
          });
        }
      });
      return true;
      break;
    case 'speech':
      playAudio(request.word);
      break;
    case 'login-youdao':
      loginYoudao();
      break;
    case 'youdao-add-word':
      const word = request.word;
      addWord(word).then(() => {
        popBadgeTips('OK', 'green');
        sendResponse();
      }, () => {
        loginYoudao();
      });
      return true;
      break;
    default:
      sendResponse();
      break;
  }
});

//解析返回的查询结果
const translateXML = (xmlnode) => {
  let noBaseTrans = false;
  let noWebTrans = false;
  let translate = "<strong>查询:</strong><br/>";
  let root = xmlnode.getElementsByTagName("yodaodict")[0];

  let retrieveDataMap = {
    'phrase': 'return-phrase', // 查询的单词、短语
    'speach': 'dictcn-speach', // 发音
    'lang': 'lang',
    'phonetic': 'phonetic-symbol'
  };
  let params = {};
  for (let key in retrieveDataMap) {
    let node = retrieveDataMap[key];
    node = root.getElementsByTagName(node);
    if (node.length) {
      let el = node[0].childNodes[0];
      if (el != "undefined") {
        params[key] = el.nodeValue;
        continue;
      }
    }
    params[key] = '';
  }

  let title = params.phrase;

  if (params.phonetic) {
    params.phonetic = "[" + params.phonetic + "]";
  }

  let basetrans = "";
  let $translations = root.getElementsByTagName("translation");
  if (!$translations.length) {
    noBaseTrans = true;
  } else if (typeof $translations[0].childNodes[0] == "undefined") {
    noBaseTrans = true;
  } else {
    for (let i = 0; i < $translations.length; i++) {
      let transContVal = $translations[i].getElementsByTagName("content")[0].textContent;
      basetrans += `<div class="ydd-trans-container">${transContVal}</div>`;
    }
  }

  let webtrans = "";
  let $webtranslations = root.getElementsByTagName("web-translation");
  if (!$webtranslations.length) {
    noWebTrans = true;
  } else if (typeof $webtranslations[0].childNodes[0] == "undefined") {
    noWebTrans = true;
  } else {
    for (let i = 0; i < $webtranslations.length; i++) {
      let key = $webtranslations[i].getElementsByTagName("key")[0].childNodes[0].nodeValue;
      let val = $webtranslations[i].getElementsByTagName("trans")[0].getElementsByTagName("value")[0].childNodes[0].nodeValue;
      webtrans += `<div class="ydd-trans-container"><a href="http://dict.youdao.com/search?q=${encodeURIComponent(key)}&keyfrom=chrome.extension&le=${params.lang}" target=_blank>${key}:</a>`;
      webtrans += val + "<br /></div>";
    }

  }
  return Render.table(title, params.speach, params.phonetic, noBaseTrans, noWebTrans, basetrans, webtrans);
};

let trans_str_tmp;
let input_str_tmp;
const translateTransXML = (xmlnode) => {
  let s = xmlnode.indexOf("CDATA[");
  let e = xmlnode.indexOf("]]");
  let input_str = xmlnode.substring(s + 6, e);
  let remain = xmlnode.substring(e + 2, xmlnode.length - 1);
  s = remain.indexOf("CDATA[");
  e = remain.indexOf("]]");
  let trans_str = remain.substring(s + 6, e);
  trans_str_tmp = trans_str.trim();
  input_str_tmp = input_str.trim();
  if ((isContainChinese(input_str_tmp) || isContainJapanese(input_str_tmp) || isContainKoera(input_str_tmp)) && input_str_tmp.length > 15) {
    input_str_tmp = input_str_tmp.substring(0, 8) + ' ...';
  } else if (input_str_tmp.length > 25) {
    input_str_tmp = input_str_tmp.substring(0, 15) + ' ...';
  }
  if (trans_str_tmp == input_str_tmp) {
    return null;
  }
  let res = `<div id="yddContainer">
      <div class="yddTop" class="ydd-sp">
        <div class="yddTopBorderlr">
          <a class="ydd-icon" href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(input_str)}&keyfrom=chrome" target=_blank">有道词典</a>
          <span>${input_str_tmp.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, "&quot;").replace(/'/g, "&#39;")}</span>
          <a href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(input_str)}&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a>
          <a class="ydd-close">&times;</a>
        </div>
      </div>
      <div class="yddMiddle">
        <div class="ydd-trans-wrapper">
          <div class="ydd-trans-container">
            ${trans_str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")}
          </div>
        </div>
      </div>
    </div>`;
  return res;
};

/**
 * 将配置更新通知已经打开的 Tab
 */
const publishOptionChangeToTabs = (Options) => {
  chrome.tabs.query({
    status: "complete"
  }, (tabs) => {
    if (tabs.length) {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          optionChanged: Options,
        }, (rep) => {
          // console.log('option changed event has been published');
        });
      });
    }
  });
};

const playAudio = (word) => {
  const audioUrl = `http://dict.youdao.com/speech?audio=${word}`;
  const audio = document.createElement('audio');
  audio.autoplay = true;
  audio.src = audioUrl;
};

// let YouDaoLoginUrl = "http://account.youdao.com/login";
// let YouDaoLoginUrl = "http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist";
const YouDaoLoginUrl = "http://dict.youdao.com/wordbook/wordlist";
// 打开登录框
const loginYoudao = () => {
  chrome.tabs.create({
    url: YouDaoLoginUrl,
  }, (win) => {});
};


const setBadge = (text, color) => {
  chrome.browserAction.setBadgeText({
    text: text
  });
  color && chrome.browserAction.setBadgeBackgroundColor({
    color: color
  });
};

const hideBadge = () => {
  setBadge('', '');
};

const popBadgeTips = (text, color) => {
  setBadge(text + '', color);
  setTimeout(hideBadge, 3e3);
};