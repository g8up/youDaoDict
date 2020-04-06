export const OPTION_STORAGE_ITEM = 'Setting';

// 登录页，重定向："http://account.youdao.com/login?service=dict&back_url=http://dict.youdao.com/wordbook/wordlist";
const LOGIN_URL = "http://account.youdao.com/login";

// 单词本，未登录时会重定向到登录页
export const WORD_LIST = 'http://dict.youdao.com/wordbook/wordlist';

export const ICON = {
  /* 默认图标 */
  DEFAULT: 'image/icon-128.png',
  /* 带朗读按钮的图标 */
  SPEAKER: 'image/icon-128-speaker.png',
};

export default{
  OPTION_STORAGE_ITEM,
  WORD_LIST,
  ICON,
};