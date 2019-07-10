import {
  IWord,
  ITranslator,
} from '../types';
import API from './API';

/**
 * 获取子节点文本
 */
const getChildVal = (root, selector) => {
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

export default class implements ITranslator{
  word: string;

  constructor(word: string) {
    this.word = word;
  }

  query(){
    return API.fetchWordOnline(this.word).then((ret) => {
      return this.parse(ret);
    }).catch((err) => {
      console.error(err);
    });
  }

  /**
   * 解析接口数据
   * @param xmlNode
   */
  parse(xmlNode):IWord {
    const root = xmlNode.querySelector('yodaodict');

    let phrase = '';
    const returnPhrase = root.querySelector('return-phrase');
    if (`${returnPhrase.childNodes[0]}` !== 'undefined') {
      phrase = returnPhrase.childNodes[0].nodeValue;
    }

    let type = '';
    if (root.querySelector('lang')) {
      type = root.querySelector('lang').childNodes[0].nodeValue;
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
      baseTrans = Array.from(translations).map((translation: HTMLElement) => {
        const content = translation.querySelector('content');
        if (content) {
          let val = content.childNodes[0].nodeValue;
          if (val.length > 50) {
            const reg = /[;；]/;
            return val.split(reg);
          }
          return val;
        }
        return '';
      }).filter(item => item);
    }

    let webTrans;
    if (webTranslations.length) { // 网络释义
      webTrans = Array.from(webTranslations).map((webTranslation: HTMLElement) => {
        const $key = webTranslation.querySelector('key');
        const $val = webTranslation.querySelector('value');
        if ($key && $val) {
          const key = $key.childNodes[0].nodeValue;
          const val = $val.childNodes[0].nodeValue;
          return `${key}: ${val}`;
        }
        return '';
      }).filter(item => item);
    }

    return {
      word: this.word,
      speech,
      ukSpeech,
      usSpeech,
      phonetic,
      ukPhonetic,
      usPhonetic,
      baseTrans: baseTrans.join(';'),
      webTrans: webTrans.join(';'),
      phrase,
      type,
    };
  }
}