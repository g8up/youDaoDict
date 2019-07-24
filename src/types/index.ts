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

// 单词朗读参数
export interface SpeachInfo {
  word: string;
  type?: string;
}

export interface ITranslator {
  word: string;

  query: ()=>any;
  parse: (resp) => IWord;
}

export interface IPagination<T> {
  list: T[]; // 记录
  pageNum: number; // 当前页
  pageSize: number; // 每页条数
  total: number; // 总条数
  totalPage: number; // 总页数
}

// 单词学习计划
export interface IPlan {
  getOne: ()=>Promise<IWord>;
}