import { downloadAsset } from '@/download';

describe('针对 downloadAsset 方法的测试集', () => {
  test('downloadAsset 能检测非合理下载链接', async () => {
    let isException = false;
    try {
      await downloadAsset('weixin://path/to/assets.js', './');
    } catch (err) {
      isException = !!err;
    }
    expect(isException).toBe(true);
  });
});
