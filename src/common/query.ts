import History from '../model/History';
import Translator from '../model/Word';
import { IWord } from '../types';

/**
 * 查询并记录历史
 */
export const queryAndRecord = (word) => {
  const translator = new Translator(word);
  return translator.query().then(async (data: IWord) => {
    const {
      word,
      speech,
      ukSpeech,
      usSpeech,
      phonetic,
      ukPhonetic,
      usPhonetic,
      baseTrans,
      webTrans,
      phrase,
      type,
    } = data;

    if (baseTrans || webTrans) {
      return await History.add(data);
    }
    else {
      console.warn('查询结果缺少翻译内容。');
    }
  });
};