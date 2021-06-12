const os = require('os');
const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');
const { getAllTargets, getTargets } = require('./target');

// 路径常量
const rootCacheDir = path.resolve(__dirname, '../.cache');

// 环境变量
const { NODE_ENV: ENV_NODE_ENV = 'development' } = process.env;

// 主入口函数
async function main() {
  await fs.remove(rootCacheDir);
  await fs.mkdir(rootCacheDir);

  const targets = getTargets();
  let targetList;
  if (targets.length > 0) {
    targetList = targets;
  } else {
    targetList = getAllTargets();
  }

  console.log(targetList);

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

main();
