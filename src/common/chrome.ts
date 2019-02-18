/**
 * 与 chrome 对接的方法
 */
import {
  parseQuerystring,
} from './util';

export const playAudio = ({ word, type }) => {
  chrome.runtime.sendMessage({
    action: 'speech',
    word,
    type,
  }, () => {});
};

export const playAudioByWordAndType = (wordAndType) => {
  playAudio(parseQuerystring(`word=${wordAndType}`));
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
