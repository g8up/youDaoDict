import Api from '../src/model/Api';

describe('API', () => {
  it('fetchTranslate', (done) => {
    const parsedType = typeof new DOMParser().
      parseFromString('<a>invariant</a>', 'text/xml'); // "object"
    Api.fetchTranslate('invariant').then(node => {
      expect(typeof node).toBe(parsedType);
      done();
    });
  });
});