import {
  isContainKoera,
  isContainJapanese,
} from './util';

const renderTransDetail = (title, body) => `<div class="ydd-trans-wrapper">
      <div class="ydd-tabs">
        <span class="ydd-tab">
          ${title}
        </span>
      </div>
      ${body}
    </div>`;

// 页面中弹出的的面板
export const table = (word, speach, strpho, noBaseTrans, noWebTrans, baseTrans, webTrans) => {
  let lan = '';
  if (isContainKoera(word)) {
    lan = '&le=ko';
  }
  if (isContainJapanese(word)) {
    lan = '&le=jap';
  }
  let fmt = '';
  const searchUrl = `http://dict.youdao.com/search?keyfrom=chrome.extension&q=${encodeURIComponent(word)}${lan}`;

  fmt = `<div id="yddContainer">
          <div class="yddTop" class="ydd-sp">
          <div class="yddTopBorderlr">
            <a class="yddKeyTitle" href="${searchUrl}" target=_blank title="查看完整释义">${word}</a>
            <span class="ydd-phonetic">${strpho}</span>
            <span class="ydd-voice">${speach}</span>
            <a class="ydd-detail" href="${searchUrl}" target=_blank>详细</a>
            <a class="ydd-detail" href="#" id="addToNote" title="添加到单词本">+</a>
            <a class="ydd-close" href="javascript:void(0);">&times;</a>
          </div>
        </div>
        <div class="yddMiddle">`;
  if (!noBaseTrans) {
    fmt += renderTransDetail('基本翻译', baseTrans);
  }
  if (!noWebTrans) {
    renderTransDetail('网络释义', webTrans);
  } else if (noBaseTrans && noWebTrans) {
    fmt += `&nbsp;&nbsp;没有英汉互译结果<br/>&nbsp;&nbsp;<a href="${searchUrl}" target=_blank>请尝试网页搜索</a>`;
  }
  fmt += '</div></div>';
  return fmt;
};

export default {
  table,
};
