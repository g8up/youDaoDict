/**
 * 与 chrome 对接的方法
 */
export const playAudio = (word) => {
  chrome.runtime.sendMessage({
    action: 'speech',
    word,
  }, () => {});
};

export const addToNote = (word, callback) => {
  chrome.runtime.sendMessage({
    action: 'youdao-add-word',
    word,
  }, (resp) => {
    if (callback) {
      callback(resp);
    }
  });
};
