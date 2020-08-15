import Setting from './model/Setting';
import { fetchWordOnline, fetchTranslateJson, addWord } from './model/Translator/Youdao/API';
import tab from './model/Tab';
import parser from './model/Parser';
import MsgType from './common/msg-type';
import {
  OPTION_STORAGE_ITEM,
} from './common/config';
import {
  isMinorVersionIncrease,
} from './common/util';
import {
  getAudioByWordAndType,
} from './common/audio-cache';
import migrate from './common/migrate';
import {
  iSetting,
} from './types/index';
import {
  initIcon,
} from './common/chrome';

migrate();

const Options: Partial<iSetting> = {};
const setting = new Setting();
setting.get().then((data) => {
  Object.assign(Options, data);

  const [, autoSpeech] = Options.auto_speech;
  initIcon(autoSpeech)
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }
  Object.keys(changes).some((key) => {
    if (key === OPTION_STORAGE_ITEM) {
      const storageChange = changes[key];
      Object.assign(Options, storageChange.newValue);
      tab.publishSettingToTabs(Options);
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
    case MsgType.GET_SETTING:
      setting.get().then((data) => {
        sendResponse({
          option: data,
        });
      });
      return true;

    case MsgType.SELECT_TO_SEARCH:
      fetchWordOnline(word).then((ret) => {
        const templateHtml = parser.translateXML(ret);
        if (templateHtml !== '') {
          sendResponse(templateHtml);
        }
      });
      return true;

    case MsgType.TRANSLATE:
      fetchTranslateJson(word).then((data) => {
        const {
          src: input,
          tgt: transStr,
        } = data;
        const templateHtml = parser.translateTransXML({
          input,
          transStr,
        });
        if (templateHtml !== '') {
          sendResponse(templateHtml);
        }
      });
      return true;

    case MsgType.SPEECH:
      if (word.length > 0) {
        playAudio(word, type);
      }
      else {
        console.error(`语音朗读-传参不可为空:${word}`);
      }
      break;

    case MsgType.LOGIN:
      tab.openWordList();
      break;

    case MsgType.ADD_WORD: // 添加到单词本
      addWord(word).then(() => {
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

  let openOptionPage = false;
  const {
    reason,
    previousVersion,
  } = details;
  if ('install' === reason) {
    openOptionPage = true;
  }
  else if ('update' === reason) {
    const {
      version,
    } = chrome.runtime.getManifest();
    // 2位版本更新时才自动弹出选项页
    openOptionPage = isMinorVersionIncrease(previousVersion, version);
  }

  if (openOptionPage) {
    chrome.tabs.create({ url: 'option.html' });
  }
});
