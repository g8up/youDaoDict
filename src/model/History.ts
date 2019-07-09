/**
 * 查询历史
 */

import * as localforage from 'localforage';
import { Word } from '../types/word';
import {
  getDate,
  getTime,
} from '../common/util';

export const HISTORY_STORE_KEY = 'word-history';

/**
 * 复写所有
 * @param words
 */
const cover = (words: Word[])=>{
  return localforage.setItem(HISTORY_STORE_KEY, words);
};

/**
 * 缓存
 * @param word string
 */
const add = async (word: Word) => {
  let cache = await localforage.getItem<Word[]>(HISTORY_STORE_KEY);
  if (!cache) {
    cache = [];
  }
  // distinct
  if (cache.some(wordItem => {
    return wordItem.word === word.word;
  })) {
    return;
  }
  Object.assign(word, {
    createtime: +new Date(),
  });
  cache.unshift(word);
  return localforage.setItem(HISTORY_STORE_KEY, cache);
};

/**
 * 读取所有
 * @param limit Number
 */
const getAll = async () => {
  let cache = await localforage.getItem<Word[]>(HISTORY_STORE_KEY);
  if (cache && cache.length) {
    return cache;
  }
  return [];
};

/**
 * 读取指定条数
 * @param limit Number
 */
const get = async (limit) => {
  if (!(limit > 0)) {
    return;
  }
  let cache = await getAll();
  if (cache && cache.length) {
    return cache.slice(0, limit);
  }
  return [];
};

/**
 * 删除一条记录
 */
const deleteOne = async (word)=>{
  const words = await getAll();
  const index = words.findIndex(item=>item.word === word);
  if( index > -1 ) {
    words.splice(index, 1);
    return cover(words);
  }
};

interface Window {
  saveAs(blob: Blob, filename: string): void;
}

/*
 * 保存为本地文件
 */
const saveContent2File = (content, filename) => {
  const blob = new Blob([content], {
    type: 'text/plain;charset=utf-8',
  });
  (window as unknown as Window).saveAs(blob, filename);
};

/*
 * 导出单词查询历史
 */
const exportIt = async () => {
  const cachedWords = await localforage.getItem<Word[]>(HISTORY_STORE_KEY);
  if (cachedWords) {
    const {
      name,
      version,
    } = chrome.runtime.getManifest();
    const timeString = `${getDate()}-${getTime()}`;
    const BR = '\r\n';
    const banner = [
      `查询历史备份文件`,
      `${timeString}`,
      `By 【${name}】V${version} `,
      'https://chrome.google.com/webstore/detail/chgkpfgnhlojjpjchjcbpbgmdnmfmmil',
      `${new Array(25).join('=')}`,
    ].join(BR).trim();

    const content = `${banner}${BR}${cachedWords.map(item=>item.word).join(`,${BR}`)}`;
    saveContent2File(content, `youDaoDict-history-${timeString}.txt`);
  }
};

export default {
  cover,
  add,
  get,
  getAll,
  exportIt,
  deleteOne,
}