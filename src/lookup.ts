import {
  isContainChinese,
  isContainJapanese,
  isContainKoera,
  isAlpha,
  spaceCount,
  extractEnglish,
  debounce,
} from './common/util';
import {
  playAudioByWordAndType,
  addToNote,
} from './common/chrome';
import {
  wrapShadowDom,
} from './common/shadow-dom';
import MsgType from './common/msg-type';
import { iSetting, SpeechType } from './types/index';
import {
  DEFAULT,
} from './model/Setting';

const Options: iSetting = DEFAULT;
const { body } = document;
let lastTime = 0;
let lastFrame;

/** 划词翻译类型 */
enum TRANSLATE_TYPE_MAP {
  /** 翻译单词 */
  WORD,
  /** 翻译句子 */
  SENTENCE,
};

let TRANSLATE_TYPE = TRANSLATE_TYPE_MAP.WORD; //

const getOptVal = (key) => {
  if (Options) {
    if (Array.isArray(Options[key])) {
      return Options[key][1];
    }
    else {
      return Options[key];
    }
  }
  return '';
};

const getYoudaoDictTemplateHtml = (word, next) => {
  chrome.runtime.sendMessage({
    action: MsgType.SELECT_TO_SEARCH,
    word,
  }, (html) => {
    if (next) {
      next(html);
    }
  });
};

const getYoudaoTrans = (word, next) => {
  chrome.runtime.sendMessage({
    action: MsgType.TRANSLATE,
    word,
  }, (data) => {
    if (next) {
      next(data);
    }
  });
};

const getPanelContent = panel => panel.shadowRoot.querySelector('#ydd-content');

const closePanel = () => {
  const panel = isPanelExist();
  if (panel) {
    const content = getPanelContent(panel);
    if (content) {
      content.classList.remove('fadeIn');
      content.innerHTML = '';
    }
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
  panel.addEventListener('load', () => console.log('panel is loaded!'));
};

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

  // 翻译单词时才绑定以下行为
  if (TRANSLATE_TYPE === TRANSLATE_TYPE_MAP.WORD) {
    // 语音播放
    (function renderAudio() {
      // 自动朗读
      if (getOptVal('auto_speech')) {
        const phonetics = cont.querySelectorAll('.ydd-voice');
        const [eng, us] = phonetics;
        if (eng || us) { // 划翻中文词时，没有读音
          let wordAndType = null;
          if (phonetics.length > 1) {
            const defaultSpeech = getOptVal('defaultSpeech');
            ({ wordAndType } = (defaultSpeech === SpeechType.eng ? eng : us).dataset);
          }
          else if (eng) {
            ({ wordAndType } = eng.dataset);
          }
          playAudioByWordAndType(wordAndType);
        }
      }
      // 朗读按钮事件
      cont.addEventListener('click', (e) => {
        const { target } = e;
        const voiceNode = target.closest('.ydd-voice');
        if (voiceNode) {
          const { wordAndType } = voiceNode.dataset;
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
  }
};

/** 选区信息 */
interface ISelectionInfo {
  /** 选区文本 */
  text: string;
  /** 选区页边距 x */
  left: number;
  top: number;
  /** 选区底边页边距 */
  bottom: number;
  right: number;
}

/** 获取选区信息 */
const getSelectionInfo = (): ISelectionInfo => {
  const selection = window.getSelection();
  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const text = range.toString();
    if (text) {
      const { top, left, right, bottom } = range.getBoundingClientRect();

      return {
        text,
        left,
        top,
        bottom,
        right,
      }
    }
  }
  return null;
};

/** 翻译选区中的句子 */
const translateSelection = () => {
  const {
    text = '',
  } = getSelectionInfo() || {};

  if (text) {
    /** 翻译句子 */
    getYoudaoTrans(text, (html) => {
      TRANSLATE_TYPE = TRANSLATE_TYPE_MAP.SENTENCE;
      createPopup(html);
    });
  }
};

const ROOT_TAG = 'chrome-extension-youdao-dict';

const appendPanel = () => {
  const panel = document.createElement(ROOT_TAG);
  // 此时新生成的节点还没确定位置，默认隐藏，以免页面暴露
  panel.style.display = '';
  panel.style.visibility = 'hidden'; // 为测量尺寸

  panel.style.userSelect = 'auto'; // enable select text
  wrapShadowDom(panel);
  body.appendChild(panel);
  addPanelEvent(panel);
  return panel;
};

const isPanelExist = () => {
  return document.querySelector<HTMLElement>(ROOT_TAG);
};

const getPanel = (): HTMLElement => {
  const panel = isPanelExist();
  if (panel) {
    return panel;
  }
  return appendPanel();
};

/* eslint-disable no-param-reassign */
const setPosition = (panel) => {
  // 采用更精确的弹框尺寸布局位置，以使当窗口超出屏幕时有更好的兼容性
  // 但初次执行时因 css 加载缓慢导致读取不准（插入的弹框 DOM 在页面底部撑满了整页宽度，高度也不精确）
  // 所以需要兼容拟定一个初始值 300 x 500
  let {
    height: frameHeight,
    width: frameWidth,
  } = panel.getBoundingClientRect();

  if (frameHeight < 1) { frameHeight = 300 } // 拟定的高度不
  if (frameWidth < 1 || frameWidth > 500) { frameWidth = 500 }

  const PADDING = 5; // 弹框与选区保持适当间距
  let frameLeft = 0;
  let frameTop = 0;
  body.style.position = 'static';

  const { scrollX, scrollY } = window;

  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  const { left, bottom, top, right } = getSelectionInfo();

  if (left + frameWidth <= vw) {
    frameLeft = left + scrollX;
  } else {
    frameLeft = right - frameWidth + scrollX;
  }
  panel.style.left = `${Math.max(frameLeft, 0)}px`;

  if (bottom + frameHeight + PADDING <= vh) {
    frameTop = scrollY + bottom + PADDING;
  } else { // 在选区之上弹出，初次弹出时因 frameHeight 拟定固定导致稍有误差
    frameTop = scrollY + top - frameHeight - PADDING;
  }
  panel.style.top = `${frameTop}px`;

  lastTime = new Date().getTime();
  lastFrame = panel;
};

const createPopup = (html) => {
  if (html !== undefined) {
    const panel = getPanel();
    const content = getPanelContent(panel);
    content.innerHTML = html;
    content.classList.add('fadeIn');
    addContentEvent(content);
    panel.style.display = '';// 设定了新节点位置，清除隐藏属性
    panel.style.visibility = 'visible'; // 为测量尺寸

    setPosition(panel);
  }
};

// 划词翻译
const onSelectToTrans = debounce((e) => {
  let word = window.getSelection().toString().trim();
  if (word.length < 1 || word.length > 2000) {
    return;
  }
  const hasJapanese = isContainJapanese(word);
  const hasChinese = isContainChinese(word);
  if (getOptVal('english_only')) {
    const hasKoera = isContainKoera(word);
    if (hasJapanese || hasChinese || hasKoera) {
      return;
    }
    // word = extractEnglish(word);
  }
  // TODO: add isEnglish function
  if (word !== '') {
    if ((!hasChinese && spaceCount(word) >= 3)
      || ((hasChinese || hasJapanese) && word.length > 4)) {
      // 翻译句子
      translateSelection();
    } else {
      // 翻译单词
      getYoudaoDictTemplateHtml(word, (html) => {
        TRANSLATE_TYPE = TRANSLATE_TYPE_MAP.WORD;
        createPopup(html);
      });
    }
  }
});

interface Node {
  data: string;
}

let prevC;
let prevO;
let triggerKey = Options.triggerKey || 'shift';
// 指词即译
const onPointToTrans = debounce((e) => {
  if (!e[`${triggerKey}Key`] ||
    ['alt', 'shift', 'ctrl', 'meta'].filter(key => key !== triggerKey).some(key => e[`${key}Key`])) {
    return;
  }
  const caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
  if (!caretRange) { return; }
  let {
    startOffset: so,
    endOffset: eo,
    startContainer,
    endContainer,
  } = caretRange;

  if (prevC === startContainer && prevO === so) { return; }
  prevC = startContainer;
  prevO = so;
  const tr = caretRange.cloneRange();
  let tempText = '';
  if (startContainer.nodeValue) {
    while (so >= 1) {
      tr.setStart(startContainer, so -= 1);
      tempText = tr.toString();
      if (!isAlpha(tempText.charAt(0))) {
        tr.setStart(startContainer, so + 1);
        break;
      }
    }
  }
  if (endContainer.nodeValue) {
    while (eo < endContainer.nodeValue.length) {
      tr.setEnd(endContainer, eo += 1);
      tempText = tr.toString();
      if (!isAlpha(tempText.charAt(tempText.length - 1))) {
        tr.setEnd(endContainer, eo - 1);
        break;
      }
    }
  }
  const word = tr.toString();
  if (word.length >= 1) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(tr);
    getYoudaoDictTemplateHtml(word, (html) => {
      TRANSLATE_TYPE = TRANSLATE_TYPE_MAP.WORD;
      createPopup(html);
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

const getOption = (next?) => {
  chrome.runtime.sendMessage({
    action: MsgType.GET_SETTING,
  }, (resp) => {
    if (resp && resp.option) {
      Object.assign(Options, resp.option);
      ({ triggerKey } = resp.option);

      dealSelectEvent();
      dealPointEvent();
    }
    if (next) { next(); }
  });
};

// some pages have no body, eg. <frameset />
if (body) {
  getOption();

  // 获取配置修改的消息
  // eslint-disable-next-line no-unused-vars
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.optionChanged) {
      Object.assign(Options, request.optionChanged);
      ({ triggerKey } = request.optionChanged);
      dealSelectEvent();
      dealPointEvent();
    }

    const { action } = request;

    switch (action) {
      case MsgType.TRANSLATE_CONTEXT:
        translateSelection();
        break;
      default: break;
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
