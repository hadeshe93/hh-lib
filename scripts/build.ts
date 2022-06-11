/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe93<hadeshe93@gmail.com>
 * @LastEditTime  : 2022-02-23 12:10:39
 * @FilePath      : /hh-lib/scripts/build.ts
 */
import os from 'os';
import path from 'path';
import execa from 'execa';
import fs from 'fs-extra';
import { getTargets, getAllTargets } from './target';

// 路径常量
const ROOT_CACHE_DIR = path.resolve(__dirname, '../.cache');
// 环境变量
const { NODE_ENV: ENV_NODE_ENV = 'development' } = process.env;

// 执行入口函数
main();

// 主入口函数
async function main() {
  await fs.remove(ROOT_CACHE_DIR);
  await fs.mkdir(ROOT_CACHE_DIR);

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
  await runParallel(os.cpus().length, targets, build);
}

// 构建任务
async function build(target) {
  const env = ENV_NODE_ENV;
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  if (pkg.private) {
    return;
  }

  await fs.remove(path.resolve(pkgDir, 'dist/'));

  await execa(
    'rollup',
    [
      '--config',
      'rollup.config.js',
      '--environment',
      [`NODE_ENV:${env}`, `TARGET:${target}`].filter(Boolean).join(','),
    ],
    { stdio: 'inherit' },
  );
}

// 并发运行
async function runParallel(maxConcurrency, targets, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of targets) {
    const p = Promise.resolve().then(() => iteratorFn(item, targets));
    ret.push(p);

    if (maxConcurrency <= targets.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}