/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-07-06 09:21:30
 * @FilePath      : /hh-lib/scripts/build-docs.ts
 */
import path from 'path';
import glob from 'glob';
import execa from 'execa';
import fs from 'fs-extra';
import { getTargets, getAllTargets } from './target';

// 路径常量
const ROOT_DIR = path.resolve(__dirname, '../');
const resolve = (...args) => path.resolve(ROOT_DIR, ...args);

// 执行入口函数
main();

// 主入口函数
async function main() {
  const targets = getTargets();
  let targetList;
  if (targets.length > 0) {
    targetList = targets;
  } else {
    targetList = getAllTargets();
  }

  console.log('构建目标列表：', targetList);
  await buildAll(targetList);
}

// 构建入口
async function buildAll(targets) {
  // 执行并行产物构建
  await buildAllDocs(targets);
}

// 执行全量文档构建
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function buildAllDocs(targets) {
  const apiDocDestPath = resolve('apps/docs/docs/');

  const apiDocDestTempPath = resolve('apps/docs/.temp-docs/');

  const tempApiJsonHubPath = resolve(`apps/docs/.temp/`);

  await fs.ensureDir(apiDocDestPath);
  await fs.ensureDir(tempApiJsonHubPath);

  await fs.emptyDir(apiDocDestTempPath);

  // 将所有包的 *.api.json 产物全部拷贝到 apps/docs 里面去
  for (const target of targets) {
    const pkgDir = resolve(`packages/${target}`);
    const apiTempReportSrcPath = path.resolve(pkgDir, './dist-temp-api-report/');
    if (!(await fs.pathExists(apiTempReportSrcPath))) continue;

    let apiJsonList = [];
    try {
      apiJsonList = await new Promise((resolve, reject) => {
        glob(path.join(apiTempReportSrcPath, '*.api.json'), {}, (err, matches) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(matches);
        });
      });
    } catch (err) {
      console.error('[buildAllDocs] 读取文档元数据异常：', err);
    }
    try {
      await Promise.all(
        apiJsonList.map((apiJsonFilePath) => {
          const tempApiJsonFilePath = path.resolve(tempApiJsonHubPath, path.basename(apiJsonFilePath));
          return fs.copy(apiJsonFilePath, tempApiJsonFilePath, { overwrite: true });
        }),
      );
    } catch (err) {
      console.error('[buildAllDocs] 拷贝文档元数据异常：', err);
    }
  }

  // 会清空掉输出目录，所以先生成到临时目录
  await execa('api-documenter', ['markdown', '-i', tempApiJsonHubPath, '-o', apiDocDestTempPath], { stdio: 'inherit' });
  // 然后清空掉原目录下的 md 文档
  if (fs.pathExists(path.resolve(apiDocDestPath, './index.md'))) {
    console.log(`${apiDocDestPath} 存在 md 文档，进行删除`);
    await execa('rm', ['-f', `${apiDocDestPath}/*.md`], { stdio: 'inherit' });
  }
  // 最后将生成的文档从临时目录拷贝回来
  await execa('cp', ['-r', `${apiDocDestTempPath}/.`, `${apiDocDestPath}/`], { stdio: 'inherit' });
}
