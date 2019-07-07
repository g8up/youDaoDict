/**
 * 迁移存储
 */

import History from '../model/History';

const MIGRATION_STORE_KEY = 'migrated';

export default ()=>{
  if (localStorage.getItem(MIGRATION_STORE_KEY) === null ) {
    const preCache = localStorage.getItem('wordcache');
    if( preCache ) {
      History.cover(preCache.split(',').map(word=>{
        return {
          word,
        };
      }));
      localStorage.setItem(MIGRATION_STORE_KEY, '1'); // mark done
    }
  }
}