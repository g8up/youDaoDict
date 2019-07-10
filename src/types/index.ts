export interface IWord {
  word: string,
  ukSpeech?: string,
  usSpeech?: string,
  phonetic?: string,
  ukPhonetic?: string,
  usPhonetic?: string,
  baseTrans?: string,
  webTrans?: string,
  createTime: number, // 添加时间
  lastView?: number, // 最后查看时间
  type?: number, // 类型
}

interface ITranslator {
  getData: (word:string)=>any;
  parse: (resp)=>IWord;
}