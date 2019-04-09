import * as util from '../src/common/util';

test('计算文本中的空格', ()=>{
  expect(util.spaceCount('a b c')).toBe(2);
  expect(util.spaceCount(' a b c ')).toBe(4);
});

test('计算文本中的中文个数是否大于5个', ()=>{
  expect(util.isContainChinese('谢朝平的《大迁徙》，记录了三门峡移民的历史遗留问题，渭南地 区的移民正是作品主角。')).toBe(true);
});

test('对象 和 queryString 互转', ()=>{
  const querySting = 'name=%E5%A4%A7%E8%BF%81%E5%BE%99&author=%E8%B0%A2%E6%9C%9D%E5%B9%B3&year=2010';
  const json = {
    name: '大迁徙',
    author: '谢朝平',
    year: '2010', // 设置为整数时，queryString parse 后会变为字符串，toEqual校验不通过
  };
  expect(util.qs(null)).toBe('');
  expect(util.qs(json)).toBe(querySting);
  expect(util.parseQuerystring(querySting)).toEqual(json);
})