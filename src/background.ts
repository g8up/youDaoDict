import Setting from './model/Setting';
import Dict from './model/Dict';
import api from './model/API';
import tab from './model/Tab';
import parser from './model/Parser';
import {
  OPTION_STORAGE_ITEM,
} from './common/config';
import {
  isMinorVersionIncrease,
} from './common/util';
import {
  getAudioByWordAndType,
} from './common/audio-cache';

const setting = new Setting();
let Options = null;
setting.get().then((data) => {
  Options = data;
});

/**
 * 将配置更新通知已经打开的 Tab
 */
const publishSettingToTabs = (options) => {
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
      publishSettingToTabs(Options);
      return true;
    }
    return false;
  });
});

const playAudio = (word, type) => {
  const audio = getAudioByWordAndType(word, type);
  audio.play();
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
    word = '',
    type, // 发音类型:英音、美音
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
      api.fetchWordOnline(word).then((ret) => {
        const templateHtml = parser.translateXML(ret);
        if (templateHtml !== '') {
          sendResponse(templateHtml);
        }
      });
      return true;
    case 'translate':
      api.fetchTranslate(word).then((ret) => {
        const templateHtml = parser.translateTransXML(ret);
        if (templateHtml !== '') {
          sendResponse({
            data: templateHtml,
          });
        }
      });
      return true;
    case 'speech':
      if (word.length > 0) {
        playAudio(word, type);
      }
      else {
        console.error(`语音朗读-传参不可为空:${word}`);
      }
      break;
    case 'login-youdao':
      tab.openWordList();
      break;
    case 'youdao-add-word': // 添加到单词本
      (new Dict(api)).add(word).then(() => {
        popBadgeTips('OK', 'green');
        sendResponse();
      }, () => {
        // eslint-disable-next-line no-alert
        if (window.confirm('需要登录，是否打开登录页？')) {
          tab.openWordList();
        }
      });
      return true;
    default:
      sendResponse();
      break;
  }
  return true;
});

/**
 * https://developer.chrome.com/extensions/runtime#event-onInstalled
 * Fired when the extension is first installed,
 * when the extension is updated to a new version,
 * and when Chrome is updated to a new version.
 */
chrome.runtime.onInstalled.addListener((details) => {
  // details: {previousVersion: "1.0.2.3", reason: "update"}
  console.log('onInstall', details);
  const {
    previousVersion,
  } = details;
  const {
    version,
  } =  chrome.runtime.getManifest();

  if( isMinorVersionIncrease(previousVersion, version) ) { // 2位版本更新时才自动弹出选项页
    chrome.tabs.create({ url: 'options.html' });
  }
});
