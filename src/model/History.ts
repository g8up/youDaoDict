/**
 * 查询历史
 */

import * as localforage from 'localforage';
import { IWord, IPagination, } from '../types';
import {
  getDate,
  getTime,
} from '../common/util';

export const HISTORY_STORE_KEY = 'word-history';

/**
 * 复写所有
 * @param words
 */
const cover = (words: IWord[]) => {
  return localforage.setItem(HISTORY_STORE_KEY, words);
};

/**
 * 缓存
 * @param word string
 */
const add = async (word: IWord) => {
  if (word && word.word === '' || word.word.trim() === '') {
    return;
  }
  let cache = await localforage.getItem<IWord[]>(HISTORY_STORE_KEY);
  if (!cache) {
    cache = [];
  }

  const existWord = cache.find(wordItem => { // 已存在
    return wordItem.word === word.word;
  });

  if (existWord) {
    Object.assign(existWord, word, {
      lastView: +new Date(), // 更新查看时间
    });
  }
  else {
    Object.assign(word, {
      createTime: +new Date(),
    });
    cache.unshift(word);
  }
  return cover(cache);
};

/**
 * 读取所有
 * @param limit Number
 */
const getAll = async (): Promise<IWord[]> => {
  let cache = await localforage.getItem<IWord[]>(HISTORY_STORE_KEY);
  if (cache && cache.length) {
    return cache;
  }
  return [];
};

/**
 * 获取指定页数据
 */
const getPage = async ({
  pageNum,
  pageSize,
}): Promise<IPagination<IWord>> => {
  const words = await getAll() || [];
  const total = words.length;
  let list = [];

  if (total > 0) {
    if (pageNum < 1) {
      pageNum = 1;
    }
    const totalPage = Math.ceil(total / pageSize);
    if (pageNum > totalPage) {
      pageNum = totalPage;
    }
    list = words.slice((pageNum - 1) * pageSize, pageNum * pageSize);
  }
  return {
    list,
    pageNum,
    pageSize,
    total,
  };
};

/**
 * 读取指定条数
 * @param limit Number
 */
const get = async (limit): Promise<IPagination<IWord>> => {
  if (!(limit > 0)) {
    return;
  }
  return await getPage({
    pageNum: 1,
    pageSize: limit,
  });
};

/**
 * 删除一条记录
 */
const deleteOne = async (word) => {
  const words = await getAll();
  const index = words.findIndex(item => item.word === word);
  if (index > -1) {
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
  const cachedWords = await localforage.getItem<IWord[]>(HISTORY_STORE_KEY);
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

    const content = `${banner}${BR}${cachedWords.map(item => item.word).join(`,${BR}`)}`;
    saveContent2File(content, `youDaoDict-history-${timeString}.txt`);
  }
};

export default {
  cover,
  add,
  getAll,
  get,
  getPage,
  exportIt,
  deleteOne,
}