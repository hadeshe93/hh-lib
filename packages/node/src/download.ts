import fs from 'fs';
import path from 'path';
import axios from 'axios';
import fsExtra from 'fs-extra';
import { getTypeOf } from '@hadeshe93/lib-common';

/**
 * 下载资源函数
 * @param url 资源地址
 * @param dest 本地目标地址
 * @param extName 选填，可以重新指定后缀名
 */
export const downloadAsset = async (url: string, dest: string, extName?: string): Promise<void> => {
  const { dir: destDir } = path.parse(dest);
  const { name, ext: oriExt } = path.parse(url);
  let ext = oriExt;
  if (getTypeOf(extName) === 'string') {
    ext = extName;
  }
  const destFilePath = path.join(destDir, `${name}.${ext}`);
  await fsExtra.ensureDir(destDir);
  await downloadCore(url, destFilePath);
};

/**
 * 核心下载逻辑
 * @param src 资源源地址
 * @param dest 本地目标地址
 */
async function downloadCore(src: string, dest: string) {
  if (!/^http(s)?:\/\//.test(src)) {
    throw new Error(`Error occurred when download asset: ${src} is not a effective link`);
  }

  // 线上地址走下载
  const resp = await axios.get(src, {
    responseType: 'stream',
  });
  resp.data.pipe(fs.createWriteStream(dest));
}
