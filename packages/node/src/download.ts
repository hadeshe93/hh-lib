import fs from 'fs';
import path from 'path';
import ora from 'ora';
import axios from 'axios';
import fsExtra from 'fs-extra';
import download, { DownloadOpts } from 'download-git-repo';
import { getTypeOf } from '@hadeshe93/lib-common';

interface DownloadGitRepoOpts extends DownloadOpts {
  ora?: boolean;
}

/**
 * 下载 git 仓库到本地
 *
 * @export
 * @param {string} repoFullName
 * @param {string} dest
 * @param {DownloadGitRepoOpts} [rawOpts]
 * @return {*}  {(Promise<undefined | Error>)}
 */
export async function downloadGitRepo(
  repoFullName: string,
  dest: string,
  rawOpts?: DownloadGitRepoOpts,
): Promise<undefined | Error> {
  rawOpts = rawOpts
    ? {
        ora: false,
        clone: false,
        ...(rawOpts || {}),
      }
    : rawOpts;
  const { ora: needOra, ...opts } = rawOpts || {};

  let sipnner;
  if (needOra) {
    sipnner = ora('Downloading ...').start();
  }
  return new Promise((resolve, reject) => {
    download(repoFullName, dest, opts, function (err) {
      if (err) {
        sipnner && sipnner.fail('Dowload failed.');
        reject(err);
        return;
      }
      sipnner && sipnner.succeed('Dowload successfully!');
      resolve(void 0);
    });
  });
}

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
