/**
 * 网络请求
 */
import fetch from 'cross-fetch';
import util from '../common/util';

enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
};

const req = (url: string, option = {}) => {
  return fetch(url, {
    headers: {
      'Content-Type': ContentType.JSON,
    },
    credentials: 'include', // fix addWord for 360 safe browser v10.0
    ...option,
  }).then(data => data.json());
};

const get = (url: string, data) => {
  return req(url + '?' + util.qs(data));
};

const post = (url: string, data) => {
  return req(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const fetchXML = (url: string, data) => {
  return fetch(url + '?' + util.qs(data), {
    headers: {
      'Content-Type': ContentType.FORM,
    },
  })
    .then(response => response.text())
    .then(str => (new DOMParser()).parseFromString(str, "text/xml"));
};

export default {
  get,
  post,
  fetchXML,
}