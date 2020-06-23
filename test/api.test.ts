import Api from '../src/model/Api';
import * as Parser from '../src/model/Parser';

describe('API', () => {
  it('fetchTranslate', (done) => {
    const parsedType = typeof new DOMParser().
      parseFromString('<a>invariant</a>', 'text/xml'); // "object"

    // https://dict.youdao.com/fsearch?q=invariant&le=eng&client=deskdict&keyfrom=chrome.extension&xmlVersion=3.2&dogVersion=1.0&ue=utf8&doctype=xml&pos=-1&vendor=getcrx.cn&appVer=3.1.17.4208
    Api.fetchTranslate("if you miss the train I am on").then(node => {

      expect(typeof node).toBe(parsedType);

      const {input, transStr} = Parser.parseTranslateData(node);
      expect(input).toBe("if you miss the train I am on");
      expect(transStr).toBe("如果你错过了我的火车");

      done();
    });
  });
});