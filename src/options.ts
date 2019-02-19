import Setting from './common/setting';
import {
  qs as queryString,
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
  fetchWordOnline,
} from './common/http';
import {
  history,
} from './common/render';

let Options = null;
let langType = '';

const setting = new Setting();
const SP = ',';
let WORD: string;

// 缓存查询词
const saveSearchedWord = (word?: string) => {
  let w = word || ($('#word') ? $('#word').value : '');
  if (w && w.trim()) {
    w = w.trim();
    let cache = localStorage.getItem('wordcache');
    if (cache) {
      // distinct
      if (cache.split(SP).includes(w)) {
        return;
      }
      cache = [w, cache].join();
    } else {
      cache = w;
    }
    localStorage.setItem('wordcache', cache);
  }
};

// 取缓存查询词
const getCachedWord = () => {
  let cache = localStorage.getItem('wordcache');
  if (cache && cache.trim()) {
    cache = cache.trim();
    const count = Options.history_count >= 0 ? Options.history_count : 0;
    const words = cache.split(SP, count);

    if (words.length) {
      let $cache = $('#cache');
      $cache.innerHTML = history(words);
      $cache.onclick = (event) => { // 查询
        const a = event.target;
        if (a.tagName.toLowerCase() === 'a') {
          const w = a.innerText;
          if (w) {
            $('#word').value = w;
            mainQuery(w, translateXML); // eslint-disable-line
          }
        }
      };
      $cache = null;
    }
  }
};

const getLink = (urlPrefix, params) => {
  const url = `${urlPrefix}?${queryString(params)}`;
  return url;
};

const buildSearchResult = ({
  phoneticSymbol,
  hasBaseTrans,
  hasWebTrans,
  baseTrans,
  webTrans,
  retphrase,
}) => {
  $('#options').style.display = 'none'; // hide option pannel
  const params = {
    q: WORD,
    ue: 'utf8',
    keyfrom: 'chrome.extension',
    le: '',
  };
  if (isContainKoera(WORD)) {
    params.le = 'ko';
  } else if (isContainJapanese(WORD)) {
    params.le = 'jap';
  } else if (langType === 'fr') {
    params.le = 'fr';
  }
  const res = $('#result');
  res.innerHTML = '<strong>查询:</strong><br/>';
  if (hasBaseTrans) {
    const langTypeMap = {
      ko: '韩汉',
      jap: '日汉',
      fr: '法汉',
    };
    res.innerHTML = `<div class="section-title">${langTypeMap[langType] || '英汉'}翻译</div>
      ${retphrase}
      ${phoneticSymbol ? `[${phoneticSymbol}]` : ''}
      <span class="word-speech" data-toggle="play" title="朗读"></span>
      <a href="#" class="add-to-note" data-toggle="addToNote" title="添加到单词本">+</a>
      ${baseTrans}`;
  }
  if (hasWebTrans) {
    res.innerHTML += `<div class="section-title">网络释义</div>${webTrans}`;
  }
  if (hasBaseTrans || hasWebTrans) {
    const link = getLink('https://dict.youdao.com/search', params);
    res.innerHTML += `<a class="weblink" href="${link}" target="_blank">查看详细释义&gt;&gt;</a>`;
  }
  if (!hasBaseTrans && !hasWebTrans) {
    res.innerHTML = `未找到英汉翻译!<br><a class="weblink" href="https://www.youdao.com/w/${encodeURIComponent(WORD)}" target="_blank">尝试用有道搜索</a>`;
  } else {
    saveSearchedWord();
  }
  getCachedWord();
  langType = '';
};

// 布局结果页
const translateXML = (xmlnode) => {
  let hasBaseTrans = true;
  let hasWebTrans = true;
  let baseTrans = '';
  let webTrans = '';
  let retphrase = '';
  const root = xmlnode.getElementsByTagName('yodaodict')[0];
  const phrase = root.getElementsByTagName('return-phrase');
  if (`${phrase[0].childNodes[0]}` !== 'undefined') {
    retphrase = phrase[0].childNodes[0].nodeValue;
  }
  if (`${root.getElementsByTagName('lang')[0]}` !== 'undefined') {
    langType = root.getElementsByTagName('lang')[0].childNodes[0].nodeValue;
  }
  let phoneticSymbol = '';
  const symbol = root.getElementsByTagName('phonetic-symbol')[0];
  if (`${symbol}` !== 'undefined') {
    if (`${symbol.childNodes[0]}` !== 'undefined') {
      const pho = symbol.childNodes[0].nodeValue;
      if (pho !== null) {
        phoneticSymbol = `${pho}`;
      }
    }
  }
  const translation = root.getElementsByTagName('translation')[0];
  if (`${translation}` === 'undefined') {
    hasBaseTrans = false;
  }
  if (`${root.getElementsByTagName('web-translation')[0]}` === 'undefined') {
    hasWebTrans = false;
  }
  if (hasBaseTrans) {
    baseTrans += '<div class="section-title">基本释义</div>';
    if (`${translation.childNodes[0]}` !== 'undefined') {
      const translations = root.getElementsByTagName('translation');
      for (let i = 0; i < translations.length; i += 1) {
        let line = `${translations[i].getElementsByTagName('content')[0].childNodes[0].nodeValue}<br/>`;
        if (line.length > 50) {
          const reg = /[;；]/;
          const childs = line.split(reg);
          line = childs.join('<br/>');
        }
        baseTrans += line;
      }
    } else {
      baseTrans += '未找到基本释义';
    }
  }
  if (hasWebTrans) {
    let webtranslations;
    // 网络释义
    if (`${root.getElementsByTagName('web-translation')[0].childNodes[0]}` !== 'undefined') {
      webtranslations = root.getElementsByTagName('web-translation');
      for (let i = 0; i < webtranslations.length; i += 1) {
        webTrans += `${webtranslations[i].getElementsByTagName('key')[0].childNodes[0].nodeValue}:  `;
        webTrans += `${webtranslations[i].getElementsByTagName('trans')[0].getElementsByTagName('value')[0].childNodes[0].nodeValue}<br/>`;
      }
    } else {
      webTrans += '未找到网络释义';
    }
  }
  buildSearchResult({
    phoneticSymbol,
    hasBaseTrans,
    hasWebTrans,
    baseTrans,
    webTrans,
    retphrase,
  });
};

const mainQuery = (word, callback) => fetchWordOnline(word).then((ret) => {
  WORD = word;
  const dataText = translateXML(ret);
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
/*
 * 保存为系统文件
 */
const saveContent2File = (content, filename) => {
  const blob = new Blob([content], {
    type: 'text/plain;charset=utf-8',
  });
  saveAs(blob, filename);
};
/*
 * 导出单词查询历史
 */
const exportHistory = () => {
  const cachedWords = localStorage.getItem('wordcache');
  if (cachedWords) {
    const extDetail = chrome.app.getDetails();
    const extName = extDetail.name;
    const { version } = extDetail;
    const BR = '\r\n';
    const banner = [
      `【${extName}】V${version} 查询历史备份文件`,
      `${new Date().toString().slice(0, 24)}`,
      'By https://chrome.google.com/webstore/detail/chgkpfgnhlojjpjchjcbpbgmdnmfmmil',
      `${new Array(25).join('=')}`,
    ].join(BR).trim();
    const content = `${banner}${BR}${cachedWords.replace(/,/g, BR)}`;
    saveContent2File(content, `youDaoCrx-history ${+new Date()}.txt`);
  }
};

const saveOptions = () => {
  Object.keys(Options).forEach((key) => {
    const elem = $(`#${key}`);
    if (Options[key][0] === 'checked') {
      Options[key][1] = elem.checked;
    } else {
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
  } = chrome.app.getDetails();
  const downloadLink = 'http://getcrx.cn/#/crxid/chgkpfgnhlojjpjchjcbpbgmdnmfmmil';
  const text = `${name}\r\n${description}\r\n${downloadLink}`;
  copyText(text);
};

window.onload = () => {
  setting.get().then((data) => {
    Options = data;
    console.log('option from sync storage', data);
    restoreOptions(data);
    changeIcon();
    getCachedWord();
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
        getCachedWord();
      };
    };
  }

  $('#word').onkeydown = (event) => {
    if (event.keyCode === 13) {
      mainQuery($('#word').value, translateXML);
    }
  };
  $('#querybutton').onclick = () => {
    mainQuery($('#word').value, translateXML);
  };
  // 导出查询记录
  $('#backup').onclick = (e) => {
    e.preventDefault();
    exportHistory();
  };
  // 登录按钮
  $('#login-youdao').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({
      action: 'login-youdao',
    }, (rep) => {
      console.log(rep);
    });
  });
  // share
  $('#share').addEventListener('click', (e) => {
    e.preventDefault();
    shareDownloadLink();
  });
  // 检测当前页面打开入口：option / popup
  (function checkEntry() {
    const { hash } = window.location;
    if (hash === '#popup') {
      document.body.classList.add('popup');
    }
  }());

  document.body.addEventListener('click', (e) => {
    const { target } = e;
    const { toggle } = target.dataset as string;
    if (toggle === 'play') {
      playAudio({ word: WORD });
    } else if (toggle === 'addToNote') {
      addToNote(WORD, () => {
        target.classList.add('green');
      });
    }
  });
};
