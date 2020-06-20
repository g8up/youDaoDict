/**
 * 解析服务端返回的 XML
 */
import render from './Render';
import {
  isContainKoera,
  isContainJapanese,
  isContainChinese,
} from '../common/util';

// 解析返回的查询结果
const translateXML = (xmlnode: Document) => {
  let hasBaseTrans = true;
  let hasWebTrans = true;
  const root = xmlnode.getElementsByTagName('yodaodict')[0];

  const retrieveDataMap = {
    phrase: 'return-phrase', // 查询的单词、短语
    speach: 'dictcn-speach', // 发音
    ukSpeech: 'uk-speech',
    usSpeech: 'us-speech',
    phonetic: 'phonetic-symbol', // 音标
    ukPhonetic: 'uk-phonetic-symbol',
    usPhonetic: 'us-phonetic-symbol',
    lang: 'lang',
  };
  const params = <any>{};
  Object.keys(retrieveDataMap).forEach((key) => {
    let node = retrieveDataMap[key];
    node = root.getElementsByTagName(node);
    if (node.length) {
      const el = node[0].childNodes[0];
      if (el !== 'undefined') {
        params[key] = el.nodeValue;
      } else {
        params[key] = '';
      }
    }
  });

  let baseTrans = '';
  const $translations = root.getElementsByTagName('translation');
  if (!$translations.length) {
    hasBaseTrans = false;
  } else if (typeof $translations[0].childNodes[0] === 'undefined') {
    hasBaseTrans = false;
  } else {
    for (let i = 0; i < $translations.length; i += 1) {
      const transContVal = $translations[i].getElementsByTagName('content')[0].textContent;
      baseTrans += `<div class="ydd-trans-container">${transContVal}</div>`;
    }
  }

  let webTrans = '';
  const $webtranslations = root.getElementsByTagName('web-translation');
  if (!$webtranslations.length) {
    hasWebTrans = false;
  } else if (typeof $webtranslations[0].childNodes[0] === 'undefined') {
    hasWebTrans = false;
  } else {
    for (let i = 0; i < $webtranslations.length; i += 1) {
      const key = $webtranslations[i].getElementsByTagName('key')[0].childNodes[0].nodeValue;
      const vals = Array.from($webtranslations[i].getElementsByTagName('trans')).map(trans => (trans as Node).textContent.trim());
      webTrans += `<div class="ydd-trans-container">
          <a href="https://dict.youdao.com/search?q=${encodeURIComponent(key)}&le=${params.lang}&keyfrom=chrome.extension" target=_blank>${key}:</a>
            ${vals.join('；')}<br />
          </div>`;
    }
  }
  return render.table({
    phrase: params.phrase,
    ukSpeech: params.ukSpeech,
    usSpeech: params.usSpeech,
    phonetic: params.phonetic,
    ukPhonetic: params.ukPhonetic,
    usPhonetic: params.usPhonetic,
    hasBaseTrans,
    hasWebTrans,
    baseTrans,
    webTrans,
  });
};

const translateTransXML = (xmlnode: Document) => {

  let input = xmlnode.querySelector('input').textContent.trim();
  let transStr = xmlnode.querySelector('translation').textContent.trim();

  const res = `<div id="yddContainer">
      <div class="yddTop" class="ydd-sp">
        <div class="yddTopBorderlr">
          <span>${input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')}</span>
          <a href="http://fanyi.youdao.com/translate?i=${encodeURIComponent(input)}&smartresult=dict&keyfrom=chrome.extension" target=_blank>详细</a>
          <a class="ydd-close">&times;</a>
        </div>
      </div>
      <div class="yddMiddle">
        <div class="ydd-trans-wrapper">
          <div class="tab-content">
            <div class="ydd-trans-container">
              ${transStr.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  return res;
};

export default {
  translateXML,
  translateTransXML
}