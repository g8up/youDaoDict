/**
 * 基础工具类
 * 为保证可测试，不应依赖 `chrome`
 */

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
  if( str.length ) {
    return str.split('').some(char => isKoera(char));
  }
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

export const extractEnglish = (word): string => {
  const patt = new RegExp(/([a-zA-Z ]+)/);
  const results = patt.exec(word);
  if (results && results.length) {
    return results[1];
  }
  return '';
};

// 去抖动
export const debounce = (fn, delay = 300) => {
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

export const parseQuerystring = <T>(querystring: string):T => {
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
  return obj as T;
};

export const copyText = (text) => {
  if (text !== undefined && text !== '') {
    var cont = document.createElement('textarea');
    cont.value = text;
    document.body.appendChild(cont);

    cont.select();
    document.execCommand('copy');
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

export const getDate = (time?) => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour12: false,
  };
  return (time ? new Date(time) : new Date()).toLocaleString('zh-cn', options);
};

export const getTime = (date?) => {
  const cur = date ? new Date(date) : new Date();
  const h = cur.getHours();
  const m = cur.getMinutes();
  const s = cur.getSeconds();
  return [h, m, s].join(':');
};

/**
 * 拼接查看详细释义链接
 */
export const getDetailLink = (urlPrefix, params) => {
  return `${urlPrefix}?${qs(params)}`;
};

export default {
  qs,
  isContainKoera,
}