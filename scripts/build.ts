/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-07-06 11:09:49
 * @FilePath      : /hh-lib/scripts/build.ts
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
// 环境变量
const { NODE_ENV: ENV_NODE_ENV = 'development' } = process.env;

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
  await runParallel(os.cpus().length, targets, build);
}

// 构建任务
async function build(target) {
  const env = ENV_NODE_ENV;
  const pkgDir = resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  const pkgCachePath = resolve(pkgDir, '.cache');
  const isExisted = await fs.pathExists(pkgCachePath);

  if (!isExisted) {
    await fs.mkdir(pkgCachePath);
  }

  if (pkg.private) {
    return;
  }

  // 删除 dist 文件夹
  await fs.remove(resolve(pkgDir, 'dist/'));
  // 执行代码构建
  await execa(
    'rollup',
    [
      '--config',
      `${resolve('build-configs/rollup.config.js')}`,
      '--environment',
      [`NODE_ENV:${env}`, `TARGET:${target}`].filter(Boolean).join(','),
    ],
    { stdio: 'inherit' },
  );
}
