import {
  AddToNoteState
} from 'index';

export const isEnglish = (str: string) => {
  for (let i = 0; i < str.length; i += 1) {
    if (str.charCodeAt(i) > 126) {
      return false;
    }
  }
  return true;
};

export const isChinese = (str: string) => {
  const re = /[^\u4e00-\u9fa5]/;
  if (re.test(str)) { return false; }
  return true;
};

export const isJapanese = (str: string) => {
  const re = /[^\u0800-\u4e00]/;
  if (re.test(str)) { return false; }
  return true;
};

export const isKoera = (str: string) => {
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F)
      || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
      return true;
    }
  }
  return false;
};

export const isContainChinese = (str: string) => {
  let cnt = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (isChinese(str.charAt(i))) { cnt += 1; }
  }
  return cnt > 5;
};

// 包含字母
export const isAlpha = str => /[a-zA-Z']+/.test(str);

export const isContainJapanese = (str: string) => {
  let cnt = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (isJapanese(str.charAt(i))) { cnt += 1; }
  }
  if (cnt > 2) { return true; }
  return false;
};

export const isContainKoera = (str: string) => {
  let cnt = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (isKoera(str.charAt(i))) { cnt += 1; }
  }
  if (cnt > 0) { return true; }
  return false;
};


export const spaceCount = (str: string): number => {
  let cnt = 0;
  for (let i = 0; i < str.length; i += 1) {
    if (str.charAt(i) === ' ') {
      cnt += 1;
    }
  }
  return cnt;
};

export const ExtractEnglish = (word): string => {
  const patt = new RegExp(/([a-zA-Z ]+)/);
  const results = patt.exec(word);
  if (results && results.length) {
    return results[1];
  }
  return '';
};

// 去抖动
export const debounce = (fn, delay = 200) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const qs = (json): string => {
  if (json) {
    return Object.keys(json).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`).join('&');
  }
  return '';
};

export const parseQuerystring = (querystring: string) => {
  const obj = {};
  if (querystring && querystring.length) {
    const kvs = querystring.split('&');
    if (kvs.length) {
      kvs.forEach((kv) => {
        const [key, val] = kv.split('=');
        obj[key] = decodeURIComponent(val);
      });
    }
  }
  return obj;
};

type Resp = string | Document | AddToNoteState;

const ajax = (option)=>{
  const {
    url,
    data
  } = option;
  return fetch(url).then(resp=>resp.json());
};

export const ajax1 = option => new Promise<Resp>((resolve: ( value: Resp)=>any, reject) => {
  const {
    url,
    type = 'GET',
    dataType = '',
    data,
  } = option;

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let ret: Resp = xhr.responseText as string;
        if (dataType === 'json') {
          try {
            ret = JSON.parse(ret) as AddToNoteState; // 添加单词本接口返回内容需要 parse
          } catch (err) {
            reject(err);
            return;
          }
        } else if (dataType === 'xml') {
          ret = xhr.responseXML as Document;
        }
        resolve(ret);
      }
    }
  };

  const queryString = qs(data);

  xhr.open(type, type === 'GET' ? url + `?${queryString}` : url , true);
  xhr.send(type === 'GET' ? null : queryString);
}).catch((err) => {
  console.warn(err);
});

export const copyText = (text: string) => {
  if (text !== undefined) {
    const cont = document.createElement('div');
    cont.textContent = text;
    document.body.appendChild(cont);

    const range = document.createRange();
    range.selectNode(cont);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    cont.remove();
  }
};

/**
 * 截取版本前两位
 */
export const cutVersion = (ver)=>{
  return ver.split('.').slice(0, 2);
};

/**
 * 版本对比
 * 版本号格式：[major, minor, patch]
 * 检查前2位版本号是否增长
 */
export const isMinorVersionIncrease = (previousVer, ver)=>{
  return cutVersion( previousVer ) < cutVersion(ver);
};

export const $ = (selector, cont = document) => cont.querySelector(selector);

export default {
  ajax,
  qs,
  isContainKoera,
}