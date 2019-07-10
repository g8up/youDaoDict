import Setting from './model/Setting';
import API from './model/API';
import render from './model/Render';
import History from './model/History';

import MsgType from './common/msg-type';
import {
  isContainKoera,
  isContainJapanese,
  copyText,
  $,
} from './common/util';
import {
  playAudio,
  addToNote,
} from './common/chrome';
import {
  iSetting,
} from './index';
import { IWord } from './types';

let Options = null;
let langType = '';

const setting = new Setting();
let WORD: string;

const renderHistory = async ()=>{
  const words = await History.get(Options.history_count);
  if (words && words.length) {
    let $cache = $('#cache');
    $cache.innerHTML = render.history(words);
    $cache.onclick = (event) => { // 查询
      const a = event.target;
      if (a.tagName.toLowerCase() === 'a') {
        const w = a.innerText;
        if (w) {
          $('#word').value = w;
          mainQuery(w, parseXML); // eslint-disable-line
        }
      }
    };
    $cache = null;
  }
};

/**
 * 获取子节点文本
 */
const getChildVal = (root, selector)=>{
  let ret = '';
  const node = root.querySelector(selector);
  if (node) {
    if (node.childNodes[0]) {
      const val = node.childNodes[0].nodeValue;
      if (val !== null) {
        ret = val;
      }
    }
  }
  return ret;
};

/**
 * 解析接口数据
 * @param xmlNode
 */
const parseXML = (xmlNode) => {
  let retphrase = '';

  const root = xmlNode.querySelector('yodaodict');
  const phrase = root.querySelector('return-phrase');

  if (`${phrase.childNodes[0]}` !== 'undefined') {
    retphrase = phrase.childNodes[0].nodeValue;
  }
  if (root.querySelector('lang')) {
    langType = root.querySelector('lang').childNodes[0].nodeValue;
  }

  let phonetic = getChildVal(root, 'phonetic-symbol');
  let ukPhonetic = getChildVal(root, 'uk-phonetic-symbol');
  let usPhonetic = getChildVal(root, 'us-phonetic-symbol');

  let speech = getChildVal(root, 'speech');
  let ukSpeech = getChildVal(root, 'uk-speech');
  let usSpeech = getChildVal(root, 'us-speech');

  const translations = root.querySelectorAll('translation');
  const webTranslations = root.querySelectorAll('web-translation');

  let baseTrans;
  if (translations.length) {
    baseTrans = Array.from(translations).map( (translation: HTMLElement) =>{
      const content = translation.querySelector('content');
      if( content ) {
        let val = content.childNodes[0].nodeValue;
        if (val.length > 50) {
          const reg = /[;；]/;
          return val.split(reg);
        }
        return val;
      }
      return '';
    }).filter(item=>item);
  }

  let webTrans;
  if (webTranslations.length) { // 网络释义
    webTrans = Array.from(webTranslations).map( (webTranslation: HTMLElement) =>{
      const $key = webTranslation.querySelector('key');
      const $val = webTranslation.querySelector('value');
      if( $key && $val) {
        const key = $key.childNodes[0].nodeValue;
        const val = $val.childNodes[0].nodeValue;
        return `${key}: ${val}`;
      }
      return '';
    }).filter(item => item);
  }

  $('#options').style.display = 'none'; // hide option pannel

  const res = $('#result');
  res.innerHTML = render.popupRender({
    word: WORD,
    phonetic,
    baseTrans,
    webTrans,
    retphrase,
    langType,
  });

  if (baseTrans || webTrans ) {
    History.add({
      word: WORD,
      speech,
      ukSpeech,
      usSpeech,
      phonetic,
      ukPhonetic,
      usPhonetic,
      baseTrans: baseTrans.join(';'),
      webTrans: webTrans.join(';'),
    } as IWord);
  }
  renderHistory();
};

const mainQuery = (word, callback) => API.fetchWordOnline(word).then((ret) => {
  WORD = word;
  const dataText = parseXML(ret);
  if (dataText != null) {
    callback(dataText);
  }
}).catch((err) => {
  console.error(err);
});

const changeIcon = () => {
  const engBox = $('#english_only');
  const dictBox = $('#dict_enable');
  const isEnabled = dictBox.checked;
  engBox.disabled = !isEnabled;
};

/**
 * 读取配置信息
 */
const restoreOptions = (option) => {
  Object.keys(option).forEach((key) => {
    const elem = $(`#${key}`);
    if (elem) {
      const val = option[key];
      if (!val) return;
      const elemType = elem.getAttribute('type');
      switch (elemType) {
        case 'checkbox':
          if (val[0] === 'checked') {
            [, elem.checked] = val;
          }
          break;
        case 'number':
          elem.value = val || option.history_count;
          break;
        default: break;
      }
    }
  });
};

const saveOptions = () => {
  Object.keys(Options).forEach((key) => {
    const elem = $(`#${key}`);
    if (Options[key][0] === 'checked') {
      Options[key][1] = elem.checked;
    }
    else {
      Options[key] = elem.value;
    }
  });
  // https://developer.chrome.com/extensions/storage
  setting.set(Options);
};

// 复制分享链接
const shareDownloadLink = () => {
  const {
    name,
    description,
  } = chrome.runtime.getManifest();
  const downloadLink = 'http://getcrx.cn/#/crxid/chgkpfgnhlojjpjchjcbpbgmdnmfmmil';
  const text = `${name}\r\n${description}\r\n${downloadLink}`;
  copyText(text);
};

const renderTriggerOption = (val)=>{
  // https://developer.chrome.com/extensions/runtime#type-PlatformOs
  chrome.runtime.getPlatformInfo(function ({os}) {
    const alt = os === 'mac' ? 'option' : 'alt';

    const triggerKey = $('#triggerKey');
    triggerKey.innerHTML = ['shift', 'alt', 'ctrl',].map(key=>{
      return `<option value="${key}">
        ${key === 'alt' ? alt : key}
      </option>`;
    }).join('');

    triggerKey.value = val;
  });
};

window.onload = () => {
  setting.get().then((data:iSetting) => {
    Options = data;
    console.log('option from sync storage', data);
    restoreOptions(data);
    changeIcon();
    renderHistory();
    renderTriggerOption(data.triggerKey);
  });
  /**
   * 配置项设置
   */
  const optElem = $('#options');
  if (optElem) {
    optElem.onmouseover = () => {
      optElem.onmouseover = null;
      $('#dict_enable').onclick = () => {
        saveOptions();
        changeIcon();
      };
      $('#ctrl_only').onclick = () => {
        saveOptions();
      };
      $('#english_only').onclick = () => {
        saveOptions();
      };
      $('#auto_speech').onclick = () => {
        saveOptions();
      };
      // eslint-disable-next-line
      $('#history_count').onclick = $('#history_count').onkeyup = () => {
        saveOptions();
        renderHistory();
      };

      $('#triggerKey').addEventListener('change', (e) => {
        saveOptions();
      });
    };
  }

  $('#word').onkeydown = (event) => {
    if (event.keyCode === 13) {
      mainQuery($('#word').value, parseXML);
    }
  };

  $('#querybutton').onclick = () => {
    mainQuery($('#word').value, parseXML);
  };

  // 导出查询记录
  $('#backup').onclick = (e) => {
    e.preventDefault();
    History.exportIt();
  };

  // 登录按钮
  $('#login-youdao').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({
      action: MsgType.LOGIN,
    }, (rep) => {
      console.log(rep);
    });
  });

  // share
  $('#share').addEventListener('click', (e) => {
    e.preventDefault();
    shareDownloadLink();
  });

  // 绑定朗读事件
  document.body.addEventListener('click', (e) => {
    const { target } = e ;
    if ((target as HTMLElement).dataset.toggle === 'addToNote') {
      addToNote(WORD, () => {
        (target as HTMLElement).classList.add('green');
      });
    }
    else {
      const voiceNode = (target as Element).closest('.phrase');
      if( voiceNode ){
        const { toggle  } = (voiceNode as HTMLElement).dataset;
        if (toggle === 'play') {
          playAudio({ word: WORD });
        }
      }
    }
  });
};
