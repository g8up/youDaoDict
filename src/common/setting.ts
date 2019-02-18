import chromeSync from './chrome-sync';
import Storage from './storage';
import {
  OPTION_STORAGE_ITEM,
} from './config';

const DEFAULT = {
  dict_enable: ['checked', false],
  ctrl_only: ['checked', true],
  english_only: ['checked', true],
  auto_speech: ['checked', true],
  history_count: 5,
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
      return setting;
    });
  }

  set(value) {
    return chromeSync.set(this.name, value);
  }
}
