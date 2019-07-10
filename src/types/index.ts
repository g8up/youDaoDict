export interface IWord {
  word: string,
  speech?: string,
  ukSpeech?: string, // 发音,eg."proactive&type=1"
  usSpeech?: string,
  phonetic?: string, // 音标
  ukPhonetic?: string,
  usPhonetic?: string,
  baseTrans?: string,
  webTrans?: string,
  createTime?: number, // 添加时间
  lastView?: number, // 最后查看时间
  type?: number, // 类型
}

interface ITranslator {
  getData: (word:string)=>any;
  parse: (resp)=>IWord;
}