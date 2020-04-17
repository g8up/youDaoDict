import chromeSync from '../common/chrome-sync';
import Storage from '../common/storage';
import {
  OPTION_STORAGE_ITEM,
} from '../common/config';
import {
  iSetting,
  SpeechType,
  TiggerKeyVal,
} from '../types/index'

// key 是 dom#id
export const DEFAULT: iSetting = {
  dict_enable: ['checked', false],
  ctrl_only: ['checked', true],
  english_only: ['checked', true],
  auto_speech: ['checked', true],
  defaultSpeech: SpeechType.us,
  history_count: 5,
  triggerKey: TiggerKeyVal.ctrl,
};

export default class Setting extends Storage {
  constructor() {
    super(OPTION_STORAGE_ITEM, DEFAULT);
  }

  get() {
    return chromeSync.get(this.name).then((rs) => {
      let setting = this.defaultValue;
      if (rs && Object.keys(rs).length > 0) {
        setting = rs[this.name];
      }
      return Object.assign(DEFAULT, setting);
    });
  }

  set(value: iSetting) {
    return chromeSync.set(this.name, value);
  }
}
