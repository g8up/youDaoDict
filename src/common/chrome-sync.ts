// https://developer.chrome.com/extensions/storage

const set = (name, value) => new Promise((resolve, reject) => {
  chrome.storage.sync.set({ [name]: value }, () => {
    resolve();
  });
}).catch((err) => {
  console.warn(err);
});

const get = name => new Promise((resolve, reject) => {
  chrome.storage.sync.get(name, (ret) => {
    resolve(ret); // 未获取到对应值，会返回 {}
  });
}).catch((err) => {
  console.warn(err);
});

export default{
  set,
  get,
};
