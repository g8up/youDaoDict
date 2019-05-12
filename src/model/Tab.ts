import {
  WORD_LIST,
} from '../common/config';
import ChromeApi from '../common/chrome-api';

/**
 * 将配置更新通知已经打开的 Tab
 */
const publishSettingToTabs = async (options) => {
  const tabs = await ChromeApi.tabs.query({
    status: 'complete',
  });

  if (tabs.length) {
    return Promise.all(tabs.map((tab) => {
      return ChromeApi.tabs.sendMessage(tab.id, {
        optionChanged: options,
      });
    }));
  }
};

// 打开单词本页面
export const openWordList = () => {
  chrome.tabs.create({
    url: WORD_LIST,
  }, () => {});
};

export default {
  publishSettingToTabs,
  openWordList,
}