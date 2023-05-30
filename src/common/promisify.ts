const promisify = (api, context = null) => (...args) => new Promise((resolve, reject) => {
  api.apply(context, args.concat((...argus) => {
    const err = chrome.runtime.lastError;
    if (err) {
      reject(err);
    } else {
      resolve(argus);
    }
  }));
}).catch(() => {
  // log(err);
});

export default promisify;
