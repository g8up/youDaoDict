import Api, { fetchTranslateJson } from '../src/model/Api';
import * as Parser from '../src/model/Parser';

describe('API', () => {
  it('fetchTranslate', (done) => {
    const parsedType = typeof new DOMParser().
      parseFromString('<a>invariant</a>', 'text/xml'); // "object"

    Api.fetchTranslate("if you miss the train I am on").then(node => {

      expect(typeof node).toBe(parsedType);

      const { input, transStr } = Parser.parseTranslateData(node);
      expect(input).toBe("if you miss the train I am on");
      expect(transStr).toBe("如果你错过了我的火车");

      done();
    });
  });

  it('fetchTranslateJson', (done) => {
    // http://fanyi.youdao.com/translate?type=AUTO&doctype=json&version=2.1&keyfrom=fanyi.web&ue=UTF-8&action=FY_BY_CLICKBUTTON&typoResult=true&i=The%20documentation%20below%20will%20give%20you%20an%20overview%20of%20what%20this%20project%20is%2C%20why%20it%20exists%20and%20how%20it%20works%20at%20a%20high%20level.
    fetchTranslateJson("if you miss the train I am on").then(data => {
      const {
        src,
        tgt,
      } = data;
      expect(src).toBe("if you miss the train I am on");
      expect(tgt).toBe("如果你错过了我的火车");

      done();
    });
  });
});