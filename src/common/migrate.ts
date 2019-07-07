/**
 * 迁移存储
 */

import * as localForage from "localforage";
import {
  HISTORY_STORE_KEY,
} from '../model/History';

const MIGRATION_STORE_KEY = 'migrated';

export default ()=>{
  if (localStorage.getItem(MIGRATION_STORE_KEY) === null ) {
    const preCache = localStorage.getItem('wordcache');
    if( preCache ) {
      localForage.setItem(HISTORY_STORE_KEY, preCache.split(',').map(word=>{
        return {
          word,
        };
      }));
      localStorage.setItem(MIGRATION_STORE_KEY, '1'); // mark done
    }
  }
}