/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-07-05 16:11:13
 * @FilePath      : /hh-lib/scripts/build-docs-meta.ts
 */
import os from 'os';
import path from 'path';
import execa from 'execa';
import fs from 'fs-extra';
import { runParallel } from './util';
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

  console.log('构建目标文档列表：', targetList);
  await buildAll(targetList);
}

// 构建入口
async function buildAll(targets) {
  // 执行并行产物构建
  await runParallel(os.cpus().length, targets, build);
}

// 构建任务
async function build(target) {
  const pkgDir = resolve(`packages/${target}`);
  const apiReportSrcPath = path.resolve(pkgDir, './dist-api-report/');
  const apiTempReportSrcPath = path.resolve(pkgDir, './dist-temp-api-report/');
  const apiExtractorJsonPath = path.resolve(pkgDir, 'api-extractor.json');

  if (await fs.pathExists(apiExtractorJsonPath)) {
    await fs.emptyDir(apiReportSrcPath);
    await fs.emptyDir(apiTempReportSrcPath);
    await execa('api-extractor', ['run', '--local', '-c', apiExtractorJsonPath], { stdio: 'inherit' });
  }
}
