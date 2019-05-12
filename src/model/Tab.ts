import {
  WORD_LIST,
} from '../common/config';

// 打开单词本页面
export const openWordList = () => {
  chrome.tabs.create({
    url: WORD_LIST,
  }, () => {});
};

export default {
  openWordList,
}