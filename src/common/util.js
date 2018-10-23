export const isEnglish = (s) => {
  for (let i = 0; i < s.length; i += 1) {
    if (s.charCodeAt(i) > 126) {
      return false;
    }
  }
  return true;
};

export const isChinese = (temp) => {
  const re = /[^\u4e00-\u9fa5]/;
  if (re.test(temp)) { return false; }
  return true;
};

export const isJapanese = (temp) => {
  const re = /[^\u0800-\u4e00]/;
  if (re.test(temp)) { return false; }
  return true;
};

export const isKoera = (str) => {
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (((str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F)
      || (str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3))) {
      return true;
    }
  }
  return false;
};

export const isContainChinese = (temp) => {
  let cnt = 0;
  for (let i = 0, len = temp.length; i < len; i += 1) {
    if (isChinese(temp.charAt(i))) { cnt += 1; }
  }
  if (cnt > 5) { return true; }
  return false;
};

export const isContainJapanese = (temp) => {
  let cnt = 0;
  for (let i = 0, len = temp.length; i < len; i += 1) {
    if (isJapanese(temp.charAt(i))) { cnt += 1; }
  }
  if (cnt > 2) { return true; }
  return false;
};

export const isContainKoera = (temp) => {
  let cnt = 0;
  for (let i = 0, len = temp.length; i < len; i += 1) {
    if (isKoera(temp.charAt(i))) { cnt += 1; }
  }
  if (cnt > 0) { return true; }
  return false;
};

export const isAlpha = str => /[a-zA-Z']+/.test(str);

export const spaceCount = (temp) => {
  let cnt = 0;
  for (let i = 0; i < temp.length; i += 1) {
    if (temp.charAt(i) === ' ') {
      cnt += 1;
    }
  }
  return cnt;
};

export const ExtractEnglish = (word) => {
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

export const qs = (json) => {
  if (json) {
    return Object.keys(json).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`).join('&');
  }
  return '';
};

export const ajax = option => new Promise((resolve, reject) => {
  let { url } = option;
  const type = option.type || 'GET';
  const dataType = (option.dataType || '').toLowerCase();
  const { data } = option;

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let ret = xhr.responseText;
        if (dataType === 'json') {
          try {
            ret = JSON.parse(ret); // 添加单词本接口返回内容需要 parse
          } catch (err) {
            reject(err);
            return;
          }
        } else if (dataType === 'xml') {
          ret = xhr.responseXML;
        }
        resolve(ret);
      }
    }
  };

  const queryString = qs(data);
  if (type === 'GET') {
    url += `?${queryString}`;
  }

  xhr.open(type, url, true);
  xhr.send(type === 'GET' ? null : queryString);
}).catch((err) => {
  console.warn(err);
});
