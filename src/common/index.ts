export declare enum AddState {
  adddone = 'adddone',
  nouser = 'nouser'
}

type Message =  AddState.adddone | AddState.nouser;

export interface AddToNoteState{
  message: Message;
}