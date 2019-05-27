export enum TiggerKeyVal {
  ctrl = 'ctrl',
  shift = 'shift',
  alt = 'alt',
}

type Val = [string, boolean];

export interface iSetting {
  dict_enable: Val,
  ctrl_only: Val,
  english_only: Val,
  auto_speech: Val,
  history_count: number,
  triggerKey: TiggerKeyVal,
}