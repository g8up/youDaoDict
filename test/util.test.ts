import * as util from '../src/common/util';
test('计算文本中的空格', ()=>{
  expect(util.spaceCount('a b c')).toBe(2);
})