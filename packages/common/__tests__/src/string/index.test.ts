import { getStrLen, getLimitedStr } from '../../../src/string/index';

describe('针对 getStrLen 方法的测试集', () => {
  test('getStrLen 能够准确测试空字符串', () => {
    expect(getStrLen('')).toBe(0);
  });

  test('getStrLen 能够准确测试带 emoji 的字符串', () => {
    expect(getStrLen('𠮷😂1️⃣🇨🇳👩‍👦🏴󠁧󠁢󠁳󠁣󠁴󠁿✏️👍🏻')).toBe(8);
  });
});

describe('针对 getLimitedStr 方法的测试集', () => {
  test('getLimitedStr 能够准确测试空字符串', () => {
    expect(getLimitedStr('', 10)).toBe('');
  });

  test('getLimitedStr 能够准确测试带 emoji 的字符串', () => {
    expect(getLimitedStr('12𠮷😂1️⃣🇨🇳👩‍👦🏴󠁧󠁢󠁳󠁣󠁴󠁿✏️👍🏻', 4, { zhCharCnt: 2, emojiCnt: 2 })).toBe('12𠮷');
    expect(getLimitedStr('12𠮷😂1️⃣🇨🇳👩‍👦🏴󠁧󠁢󠁳󠁣󠁴󠁿✏️👍🏻', 5, { zhCharCnt: 2, emojiCnt: 2 })).toBe('12𠮷');
    expect(getLimitedStr('12𠮷😂1️⃣🇨🇳👩‍👦🏴󠁧󠁢󠁳󠁣󠁴󠁿✏️👍🏻', 6, { zhCharCnt: 2, emojiCnt: 2 })).toBe('12𠮷😂');
  });
});
