/**
 * 网络请求
 */
import util from '../common/util';

enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
};

const req = (url, option = {}) => {
  return fetch(url, {
    headers: {
      'Content-Type': ContentType.JSON,
    },
    ...option,
  }).then(data => data.json());
};

const get = (url, data) => {
  return req(url + '?' + util.qs(data));
};

const post = (url, data) => {
  return req(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const fetchXML = (url, data) => {
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