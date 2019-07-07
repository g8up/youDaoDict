export interface Word {
  word: string,
  ukSpeech?: string,
  usSpeech?: string,
  phonetic?: string,
  ukPhonetic?: string,
  usPhonetic?: string,
  baseTrans?: string,
  webTrans?: string,
  createtime?: number, // 添加时间
  type?: number, // 类型
}