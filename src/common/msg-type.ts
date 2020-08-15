enum MSG_TYPE {
  /** 划词翻译， content->background*/
  SELECT_TO_SEARCH = 'select-to-search',

  /** 添加到单词本: content->bg, popup->bg */
  ADD_WORD = 'add-word',

  /** 朗读发音 */
  SPEECH = 'speech',

  /** 登录 */
  LOGIN = 'login-youdao',

  /** 获取设置 */
  GET_SETTING = 'get-setting',

  /** 翻译 */
  TRANSLATE = 'translate',
};

export default MSG_TYPE;