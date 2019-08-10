import Setting from './model/Setting';
import Dict from './model/Dict';
import api from './model/API';
import tab from './model/Tab';
import parser from './model/Parser';
import Histroy from './model/History';
import MsgType from './common/msg-type';
import {
  OPTION_STORAGE_ITEM,
} from './common/config';
import {
  isMinorVersionIncrease,
  parseWordAndType,
} from './common/util';
import {
  getAudioByWordAndType,
} from './common/audio-cache';
import migrate from './common/migrate';
import Plan from 'Model/Plan/Page';

migrate();

const Options = {};
const setting = new Setting();
setting.get().then((data) => {
  Object.assign(Options, data);
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
      api.fetchWordOnline(word).then((ret) => {
        const templateHtml = parser.translateXML(ret);
        if (templateHtml !== '') {
          sendResponse(templateHtml);
        }
      });
      return true;

    case MsgType.TRANSLATE:
      api.fetchTranslate(word).then((ret) => {
        const templateHtml = parser.translateTransXML(ret);
        if (templateHtml !== '') {
          sendResponse({
            data: templateHtml,
          });
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

  let openOptionPage = false;
  const {
    reason,
    previousVersion,
  } = details;
  if( 'install' === reason ) {
    openOptionPage = true;
  }
  else if ('update' === reason){
    const {
      version,
    } =  chrome.runtime.getManifest();
    // 2位版本更新时才自动弹出选项页
    openOptionPage = isMinorVersionIncrease(previousVersion, version);
  }

  if (openOptionPage ) {
    chrome.tabs.create({ url: 'option.html' });
  }
});

const plan = new Plan();

const remind = async ()=>{
  let wordEntry = await plan.getOne();

  if (wordEntry ) {
    let {
      word,
      baseTrans,
      webTrans,
      phonetic,
      ukSpeech,
      lastView,
    } = wordEntry;

    chrome.notifications.create({
      type: "basic",
      title: `${word} ${phonetic ? `/${phonetic}/` : ''}`,
      message: `${baseTrans || webTrans || ''}`,
      iconUrl: "../image/icon-128.png",
      requireInteraction: false,
      buttons: [{
        title: '删除',
      }]
    }, (notificationId)=>{
        const handle = (id) => {
          if (id == notificationId) {
            // do something
            alert(word)
            chrome.notifications.clear(id);
            chrome.notifications.onClicked.removeListener(handle);
          }
        };
        chrome.notifications.onClicked.addListener(handle);

        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex)=>{
          if (buttonIndex === 0 ) { // 删除
            if (confirm(`确定删除 ${word} ？`) ) {
              Histroy.deleteOne(word).then(()=>{
                popBadgeTips('OK', 'green');
              });
            }
          }
        });
    });

    const {
      word : w,
      type,
    } = parseWordAndType(ukSpeech);
    playAudio(w, type);
  }
  else {
    console.warn('暂无历史查询记录可供提醒');
  }
};

chrome.alarms.onAlarm.addListener((alarm) => {
  const {
    name,
    periodInMinutes,
  } = alarm;

  console.table(alarm); // for debug

  switch( name ) {
    case 'remind': {
      remind();
      break;
    }
    default: break;
  }
});

remind();
chrome.alarms.create('remind', {
  periodInMinutes: 5, // unit: mins
});