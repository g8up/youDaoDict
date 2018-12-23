import {
  isContainChinese,
  isContainJapanese,
  isContainKoera,
  isAlpha,
  spaceCount,
  ExtractEnglish,
  debounce,
} from './common/util';
import {
  playAudioByWordAndType,
  addToNote,
} from './common/chrome';
import {
  wrapShadowDom,
} from './common/shadow-dom';

const Options = {};
const { body } = document;
const list = [];
let lastTime = 0;
let lastFrame;
let PANEL = null;

const getOptVal = (strKey) => {
  if (Options !== null) {
    return Options[strKey][1];
  }
  return '';
};

const getYoudaoDictTemplateHtml = (word, next) => {
  chrome.runtime.sendMessage({
    action: 'select-to-search',
    word,
  }, (html) => {
    if (next) {
      next(html);
    }
  });
};

const getYoudaoTrans = (word, next) => {
  chrome.runtime.sendMessage({
    action: 'translate',
    word,
  }, (data) => {
    if (next) {
      next(data);
    }
  });
};

const getPanelContent = panel => panel.shadowRoot.querySelector('#ydd-content');

const closePanel = () => {
  const content = getPanelContent(PANEL);
  if (content) {
    content.classList.remove('fadeIn');
    content.innerHTML = '';
  }
};

/* eslint-disable no-param-reassign */
const addPanelEvent = (panel) => {
  panel.setAttribute('draggable', true);
  // panel.innerHTML += html;

  // 拖放
  let distanceX;
  let distanceY;
  panel.ondragstart = (e) => {
    distanceX = e.x - Number.parseInt(panel.style.left, 10);
    distanceY = e.y - Number.parseInt(panel.style.top, 10);
  };
  panel.ondragend = (e) => {
    panel.style.left = `${e.x - distanceX}px`;
    panel.style.top = `${e.y - distanceY}px`;
    distanceX = 0;
    distanceY = 0;
  };
};

/* eslint-enable no-param-reassign */
const addContentEvent = (cont) => {
  // 关闭按钮
  cont.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  // 防止触发划词查询
  cont.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  });
  let closeBtn = cont.querySelector('.ydd-close');
  closeBtn.onclick = () => {
    closePanel();
  };
  closeBtn = null;
  // 语音播放
  (function renderAudio() {
    // 自动朗读
    if (getOptVal('auto_speech')) {
      const usPhonetic = cont.querySelector('.ydd-voice');
      if (usPhonetic) {
        const { wordAndType } = usPhonetic.dataset;
        playAudioByWordAndType(wordAndType);
      }
    }
    // 朗读按钮事件
    cont.addEventListener('click', (e) => {
      const { target } = e;
      if (target.classList.contains('ydd-voice')) {
        const { wordAndType } = target.dataset;
        playAudioByWordAndType(wordAndType);
        if (getOptVal('auto_speech')) {
          playAudioByWordAndType(wordAndType);
        }
      }
    });
  }());
  // 添加到单词本
  const addBtn = cont.querySelector('#addToNote');
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const word = cont.querySelector('.yddKeyTitle').textContent.trim();
    if (word) {
      addToNote(word, () => {
        addBtn.classList.add('green');
      });
    }
  });
};

const ROOT_TAG = 'chrome-extension-youdao-dict';

const getPanel = () => {
  const panel = document.createElement(ROOT_TAG);
  panel.style.display = 'none';// 此时新生成的节点还没确定位置，默认隐藏，以免页面暴露
  wrapShadowDom(panel);
  body.appendChild(panel);
  addPanelEvent(panel);
  return panel;
};

const updatePanelContent = (panel, html) => {
  const content = getPanelContent(PANEL);
  content.innerHTML = html;
  content.classList.add('fadeIn');
  addContentEvent(content);
  return panel;
};

const createPopUp = (html, senctence, x, y, screenX, screenY) => {
  const frameHeight = 150;
  const frameWidth = 300;
  const padding = 10;
  let frameLeft = 0;
  let frameTop = 0;
  const frame = PANEL || (PANEL = getPanel());
  updatePanelContent(frame, html);
  body.style.position = 'static';
  // 确定位置
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;
  if (screenX + frameWidth < screenWidth) {
    frameLeft = x;
  } else {
    frameLeft = (x - frameWidth - 2 * padding);
  }
  frame.style.left = `${frameLeft}px`;
  if (screenY + frameHeight + 20 < screenHeight) {
    frameTop = y;
  } else {
    frameTop = (y - frameHeight - 2 * padding);
  }
  frame.style.top = `${frameTop + 10}px`;
  if (frame.style.left + frameWidth > screenWidth) {
    frame.style.left -= frame.style.left + frameWidth - screenWidth;
  }
  const leftbottom = frameTop + 10 + frame.clientHeight;
  if (leftbottom < y) {
    const newtop = y - frame.clientHeight;
    frame.style.top = `${newtop}px`;
  }
  frame.style.display = '';// 设定了新节点位置，清除隐藏属性
  list.push(frame);
  lastTime = new Date().getTime();
  lastFrame = frame;
};

const createPopUpEx = (html, x, y, screenx, screeny) => {
  if (html !== undefined) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      createPopUp(html, sel.getRangeAt(0).startContainer.nodeValue, x, y, screenx, screeny);
    }
  }
};

// 划词翻译
const onSelectToTrans = debounce((e) => {
  let word = window.getSelection().toString().trim();
  if (word.length < 1 || word.length > 2000) {
    return;
  }
  const {
    pageX: xx,
    pageY: yy,
    screenX: sx,
    screenY: sy,
  } = e;
  const hasJapanese = isContainJapanese(word);
  const hasChinese = isContainChinese(word);
  if (getOptVal('english_only')) {
    const hasKoera = isContainKoera(word);
    if (hasJapanese || hasChinese || hasKoera) {
      return;
    }
    word = ExtractEnglish(word);
    // TODO: add isEnglish function
    if (word !== '') {
      getYoudaoDictTemplateHtml(word, (html) => {
        createPopUpEx(html, xx, yy, sx, sy);
      });
    }
  } else if ((!hasChinese && spaceCount(word) >= 3)
    || ((hasChinese || hasJapanese) && word.length > 4)) {
    getYoudaoTrans(word, (data) => {
      createPopUpEx(data, xx, yy, sx, sy);
    });
  }
});

let prevC;
let prevO;
// 指词即译
const onPointToTrans = debounce((e) => {
  if (!e.ctrlKey || e.shiftKey || e.altKey) {
    return;
  }
  const caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
  if (!caretRange) { return; }
  let so = caretRange.startOffset;
  let eo = caretRange.endOffset;
  if (prevC === caretRange.startContainer && prevO === so) { return; }
  prevC = caretRange.startContainer;
  prevO = so;
  const tr = caretRange.cloneRange();
  let tempText = '';
  if (caretRange.startContainer.data) {
    while (so >= 1) {
      tr.setStart(caretRange.startContainer, so -= 1);
      tempText = tr.toString();
      if (!isAlpha(tempText.charAt(0))) {
        tr.setStart(caretRange.startContainer, so + 1);
        break;
      }
    }
  }
  if (caretRange.endContainer.data) {
    while (eo < caretRange.endContainer.data.length) {
      tr.setEnd(caretRange.endContainer, eo += 1);
      tempText = tr.toString();
      if (!isAlpha(tempText.charAt(tempText.length - 1))) {
        tr.setEnd(caretRange.endContainer, eo - 1);
        break;
      }
    }
  }
  const word = tr.toString();
  if (word.length >= 1) {
    const {
      pageX: xx,
      pageY: yy,
      screenX: sx,
      screenY: sy,
    } = e;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(tr);
    getYoudaoDictTemplateHtml(word, (html) => {
      createPopUpEx(html, xx, yy, sx, sy);
    });
  }
});

function dealSelectEvent() {
  if (getOptVal('dict_enable')) {
    body.removeEventListener('mouseup', onSelectToTrans);
    body.addEventListener('mouseup', onSelectToTrans);
  } else {
    body.removeEventListener('mouseup', onSelectToTrans);
  }
}

const dealPointEvent = () => {
  if (getOptVal('ctrl_only')) {
    document.removeEventListener('mousemove', onPointToTrans);
    document.addEventListener('mousemove', onPointToTrans);
  } else {
    document.removeEventListener('mousemove', onPointToTrans);
  }
};

const getOption = (next) => {
  chrome.runtime.sendMessage({
    action: 'getOption',
  }, (resp) => {
    if (resp && resp.option) {
      Object.assign(Options, resp.option);

      dealSelectEvent();
      dealPointEvent();
    }
    if (next) { next(); }
  });
};


// some page has no body, eg. <frameset />
if (body) {
  getOption();

  // 获取配置修改的消息
  // eslint-disable-next-line no-unused-vars
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.optionChanged) {
      Object.assign(Options, request.optionChanged);

      dealSelectEvent();
      dealPointEvent();
    }
  });

  // close window
  document.addEventListener('click', () => {
    if (lastFrame) {
      const cur = new Date().getTime();
      if (cur - lastTime < 500) {
        return;
      }
      closePanel();
      lastFrame = null;
    }
  });
}
