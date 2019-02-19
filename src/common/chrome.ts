/**
 * 与 chrome 对接的方法
 */
import {
  parseQuerystring,
} from './util';

interface SpeachInfo {
  word: string;
  type?: string;
}

export const playAudio = ({ word, type }: SpeachInfo) => {
  chrome.runtime.sendMessage({
    action: 'speech',
    word,
    type,
  }, () => {});
};

export const playAudioByWordAndType = (wordAndType: SpeachInfo) => {
  playAudio(parseQuerystring(`word=${wordAndType}`) as SpeachInfo);
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
