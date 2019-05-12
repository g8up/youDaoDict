import promisify from './promisify';

type TabApi = {
  create?: (param: any, option?: any)=>Promise<any>,
  query?: (param: any, option?: any)=>Promise<any>,
  sendMessage?: (param: any, option?: any)=>Promise<any>,
};

const wrap = (funcs, context): TabApi=>{
  const api:TabApi = {};
  funcs.forEach(func=>{
    api[func] = promisify(context[func], context);
  });
  return api;
};

const tabs = wrap([
  'create',
  'query',
  'sendMessage',
], chrome.tabs);

export default {
  tabs,
}