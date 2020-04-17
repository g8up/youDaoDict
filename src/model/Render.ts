/**
 * 界面渲染
 */

import {
  isContainKoera,
  isContainJapanese,
  getDetailLink,
} from '../common/util';
import {
  IWord,
} from '../types';

// content
const renderTransDetail = (title, content) =>
  `<div class="ydd-trans-wrapper">
    <div class="ydd-tabs">
      <span class="ydd-tab">
        ${title}
      </span>
    </div>
    <div class="tab-content">
      ${content}
    </div>
  </div>`;

const renderSpeech = ({
  title,
  wordAndType,
  phonetic,
}) => `<div class="ydd-voice voice-wrap" data-word-and-type="${wordAndType}">
    ${title}:
    <span class="voice-icon"></span>
    ${phonetic ? `<span> [${phonetic}] </span>` : ''}
  </div>`;

// 页面中弹出的的面板
const table = ({
  phrase: word,
  ukSpeech,
  usSpeech,
  phonetic = '',
  ukPhonetic,
  usPhonetic,
  hasBaseTrans,
  hasWebTrans,
  baseTrans,
  webTrans,
}) => {
  let lan = '';
  if (isContainKoera(word)) {
    lan = '&le=ko';
  } else if (isContainJapanese(word)) {
    lan = '&le=jap';
  }
  const searchUrl = `https://dict.youdao.com/search?keyfrom=chrome.extension&q=${encodeURIComponent(word)}${lan}`;

  return `
    <div id="yddContainer">
      <div class="yddTop" class="ydd-sp">
        <div class="yddTopBorderlr">
          <a class="yddKeyTitle" href="${searchUrl}" target="_blank" title="查看网页完整释义">${word}</a>
          <a class="ydd-detail" href="javascript:void(0);" id="addToNote" title="添加到单词本">+</a>
          <a class="ydd-close" href="javascript:void(0);">&times;</a>
        </div>
      </div>
      <div class="yddMiddle">
        ${(ukSpeech || usSpeech) ? renderTransDetail('发音', `
          ${ukSpeech ? renderSpeech({
            title: '英',
            wordAndType: ukSpeech,
            phonetic: ukPhonetic,
          }) : ''}
          ${usSpeech ? renderSpeech({
            title: '美',
            wordAndType: usSpeech,
            phonetic: usPhonetic,
          }) : ''}
        `) : ''}
        ${hasBaseTrans ? renderTransDetail('基本翻译', baseTrans) : ''}
        ${hasWebTrans ? renderTransDetail('网络释义', webTrans) : ''}
        ${!hasBaseTrans && !hasWebTrans ? `&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="${searchUrl}" target=_blank>请尝试网页搜索</a>` : ''}
      </div>
    </div>`;
};

/**
 * popup render
 */
const popupRender = ({
  word,
  phonetic,
  baseTrans,
  webTrans,
  phrase,
  type,
}) => {
  const le = isContainKoera(word) ? 'ko'
    : isContainJapanese(word) ? 'jap'
    : type === 'fr' ? 'fr'
    : '';
  const params = {
    q: word,
    ue: 'utf8',
    keyfrom: 'chrome.extension',
    le,
  };

  const langTypeMap = {
    ko: '韩汉',
    jap: '日汉',
    fr: '法汉',
  };

  return baseTrans || webTrans ? `
    ${baseTrans ?
      `<div class="section-title" > ${ langTypeMap[type] || '英汉' }翻译</div>
      <span class="phrase" data-toggle="play" data-word="${phrase}">
        ${ phrase }
        ${ phonetic ? `[${phonetic}]` : '' }
        <span class="voice-icon" title="朗读"></span>
      </span>
      <a class="add-to-note" data-toggle="addToNote" data-word="${phrase}" title="添加到单词本">+</a>
      <div class="section-title">基本释义</div>
      ${ baseTrans}` : '未找到基本释义'}

      ${ webTrans ? `<div class="section-title">网络释义</div>${webTrans}` : '未找到网络释义'}
      ${ baseTrans || webTrans ? `<a class="weblink" href="${getDetailLink('https://dict.youdao.com/search', params)}" target="_blank">查看详细释义&gt;&gt;</a>` : ''}`
    :
      `<div>未找到英汉翻译！</div>
      <a class="weblink" href="https://www.youdao.com/w/${encodeURIComponent(word)}" target="_blank">尝试用有道搜索</a>`;
};

// popup 查询历史
const history = (words: IWord[]) => `<div class="section-title">查询历史</div>
  ${words.map(word => `<a class="link">${word.word}</a>`).join('<br/>')}`;

export default {
  table,
  history,
  popupRender,
};
