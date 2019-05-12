enum MSG_TYPE {
  // content->background
  SELECT_TO_SEARCH = 'select-to-search',

  // 添加到单词本: content->bg, popup->bg
  ADD_WORD = 'add-word',

  // 发音
  SPEECH = 'speech',

  // 登录
  LOGIN = 'login-youdao',

  // 获取设置
  GET_SETTING = 'get-setting',

  TRANSLATE = 'translate',
};

export default MSG_TYPE;