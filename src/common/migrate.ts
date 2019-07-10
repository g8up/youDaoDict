/**
 * 迁移存储
 */
import { IWord } from '../types';
import History from '../model/History';

const MIGRATION_STORE_KEY = 'migrated';

export default ()=>{
  if (localStorage.getItem(MIGRATION_STORE_KEY) === null ) { // null ==> v1
    const preCache = localStorage.getItem('wordcache');
    if( preCache ) {
      History.cover(preCache.split(',').map((word): IWord=>{
        return {
          word,
          createTime: +new Date(),
        };
      }));
    }
    localStorage.setItem(MIGRATION_STORE_KEY, 'v1'); // mark done
  }
}