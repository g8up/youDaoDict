import History from '../model/History';
import Translator from '../model/Translator/Youdao/Word';
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
      await History.add(data);
    }
    return data;
  });
};