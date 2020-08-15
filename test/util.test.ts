import * as util from '../src/common/util';

describe('文本处理', ()=>{
  describe('语言判断', ()=>{
    const chinese = '大迁徙';
    const english = 'daqianxi';
    const jap = 'の';
    const koera = '대이동';

    test('英文判断', ()=>{
      expect(util.isEnglish(chinese)).toBeFalsy();
      expect(util.isEnglish(english)).toBeTruthy();
    });

    test('中文判断', ()=>{
      expect(util.isChinese(chinese)).toBeTruthy();
      expect(util.isChinese(english)).toBeFalsy();
    });

    test('日文判断', ()=>{
      expect(util.isJapanese(jap)).toBeTruthy();
      expect(util.isJapanese(chinese)).toBeFalsy();
    });

    test('韩文判断', ()=>{
      expect(util.isKoera(koera)).toBeTruthy();
      expect(util.isKoera(chinese)).toBeFalsy();
      expect(util.isContainKoera('传闻并非事实')).toBeFalsy();
    });

    test('字母判断', ()=>{
      expect(util.isAlpha('da qian xi')).toBeTruthy();
      expect(util.isAlpha(chinese)).toBeFalsy();
      expect(util.isAlpha(`a${chinese}b`)).toBeTruthy();
    });
  });

  test('计算文本中的空格', ()=>{
    expect(util.spaceCount('a b c')).toBe(2);
    expect(util.spaceCount(' a b c ')).toBe(4);
  });

  test('计算文本中的中文个数是否大于5个', ()=>{
    expect(util.isContainChinese('谢朝平的《大迁徙》，记录了三门峡移民的历史遗留问题，渭南地 区的移民正是作品主角。')).toBe(true);
  });
});

test('对象 和 queryString 互转', ()=>{
  const json = {
    name: '大迁徙',
    author: '谢朝平',
    year: '2010', // 设置为整数时，queryString parse 后会变为字符串，toEqual校验不通过
  };
  const querySting = 'name=%E5%A4%A7%E8%BF%81%E5%BE%99&author=%E8%B0%A2%E6%9C%9D%E5%B9%B3&year=2010';
  expect(util.qs(null)).toBe('');
  expect(util.qs(json)).toBe(querySting);
  expect(util.parseQuerystring(querySting)).toEqual(json);
});

test('检查前2位版本号是否增长', ()=>{
  expect(util.isMinorVersionIncrease('3.2.7', '3.3.0')).toBeTruthy();
  expect(util.isMinorVersionIncrease('3.2.7', '3.2.7.1')).toBeFalsy();
  expect(util.isMinorVersionIncrease('3.2.7', '3.2.8')).toBeFalsy();
});