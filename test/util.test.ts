import * as util from '../src/common/util';

test('计算文本中的空格', ()=>{
  expect(util.spaceCount('a b c')).toBe(2);
  expect(util.spaceCount(' a b c ')).toBe(4);
});

test('计算文本中的中文个数是否大于5个', ()=>{
  expect(util.isContainChinese('谢朝平的《大迁徙》，记录了三门峡移民的历史遗留问题，渭南地 区的移民正是作品主角。')).toBe(true);
});