/**
 * 与 chrome 对接的方法
 */
import {
  parseQuerystring,
} from './util';
import MsgType from './msg-type';
import {
  SpeachInfo,
} from '../types';
import { ICON } from './config';

export const playAudio = ({ word, type }: SpeachInfo) => {
  chrome.runtime.sendMessage({
    action: MsgType.SPEECH,
    word,
    type,
  });
};

export const playAudioByWordAndType = (wordAndType: SpeachInfo) => {
  playAudio(parseQuerystring<SpeachInfo>(`word=${wordAndType}`));
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

export const notify = ({
  title,
  message,
})=>{
  chrome.notifications.create(null, {
    type: 'basic',
    iconUrl: 'image/icon-128.png',
    title,
    message,
  });
};


const setIcon = (path) => {
  chrome.browserAction.setIcon({
    path,
  });
};

export const setSpeakerIcon = ()=>{
  setIcon(ICON.SPEAKER);
};

export const setDefaultIcon = () => {
  setIcon(ICON.DEFAULT);
};

export const initIcon = (autoSpeech)=>{
  if (autoSpeech) {
    setSpeakerIcon();
  }
  else {
    setDefaultIcon();
  }
};