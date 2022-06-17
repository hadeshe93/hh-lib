import { checkIsMobile, getMobileOSTypeMap } from '@/browser/index';

describe('针对 checkIsMobile 方法的测试集', () => {
  test('checkIsMobile 能检测移动端', () => {
    expect(checkIsMobile()).toBe(true);
  });

  test('checkIsMobile 能检测非移动端', () => {
    const DESKTOP_CHROME_UA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36';
    expect(checkIsMobile(DESKTOP_CHROME_UA)).toBe(false);
  });
});

describe('针对 getMobileOSTypeMap 方法的测试集', () => {
  test('getMobileOSTypeMap 能正确检测移动端', () => {
    expect(getMobileOSTypeMap().ios).toBe(true);
  });
});
