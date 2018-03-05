const set = ( name, value ) =>{
  return new Promise((reject, resolve) => {
    chrome.storage.sync.set({ [name]: value },  () {
      resolve();
    });
  });
}

const get = (name) => {
  return new Promise((reject, resolve) => {
    chrome.storage.sync.get( name,  (ret) =>{
      resolve(ret);
    });
  });
}

export default{
  set,
  get,
}