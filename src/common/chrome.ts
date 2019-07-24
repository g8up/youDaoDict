/**
 * 与 chrome 对接的方法
 */
import {
  parseQuerystring,
} from './util';
import MsgType from './msg-type';
import {
  SpeachInfo,
} from '../types/index';

export const playAudio = ({ word, type }: SpeachInfo) => {
  chrome.runtime.sendMessage({
    action: MsgType.SPEECH,
    word,
    type,
  });
};

export const playAudioByWordAndType = (wordAndType: string) => {
  playAudio(parseQuerystring(wordAndType) as SpeachInfo);
};

export const addToNote = (word, callback) => {
  chrome.runtime.sendMessage({
    action: MsgType.ADD_WORD,
    word,
  }, (resp) => {
    if (callback) {
      callback(resp);
    }
  });
};
