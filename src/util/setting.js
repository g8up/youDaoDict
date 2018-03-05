import Storage from '../util/storage'
import { DEFAULT_OPTION } from './config'
import chromeSync from './chrome'

const optionKey = 'ColorOptions';

class Option extends Storage{
  constructor(){
    super(optionKey, DEFAULT_OPTION)
  }

  get(){
    return chromeSync.get( this.name).then( rs =>{

    })
  }
}