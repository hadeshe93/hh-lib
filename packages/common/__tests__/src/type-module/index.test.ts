import { getTypeOf } from '../../../src/misc';

describe('针对 getTypeOf 方法的测试集', () => {
  test('getTypeOf 能够准确测试空字符串', () => {
    expect(getTypeOf('')).toBe('string');
  });
});
