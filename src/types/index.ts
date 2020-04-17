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
  phrase?: string, // 接口返回的查询词
  type?: string, // 类型
}

export interface ITranslator {
  word: string;

  query: ()=>any;
  parse: (resp) => IWord;
}

export interface SpeachInfo {
  /** 朗读单词 */
  word: string;
  /** 朗读类型 */
  type?: string;
}

/** 指词热键 */
export enum TiggerKeyVal {
  ctrl = 'ctrl',
  shift = 'shift',
  alt = 'alt',
}

/** [节点] */
type Val = [string, boolean];

/** 发音类型 */
export enum SpeechType {
  /** 英音 */
  eng = '1' ,
  /** 美音 */
  us = '2',
}

export interface iSetting {
  dict_enable: Val,
  ctrl_only: Val,
  english_only: Val,
  auto_speech: Val,
  /** Popup 界面默认发音类型 */
  defaultSpeech: SpeechType,
  history_count: number,
  triggerKey: TiggerKeyVal,
}