/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-08-12 11:10:27
 * @FilePath      : /hh-lib/scripts/build-packages.ts
 */
import path from 'path';
import execa from 'execa';
import fs from 'fs-extra';
import { getTargets, getAllPackageTargets } from './common/target';
import BaseBuilder from './base-builder';

// 路径常量
const ROOT_DIR = path.resolve(__dirname, '../');
const resolve = (...args) => path.resolve(ROOT_DIR, ...args);
// 环境变量
const { NODE_ENV: ENV_NODE_ENV = 'development' } = process.env;

class PackagesBuilder extends BaseBuilder {
  constructor() {
    super();
    const targets = getTargets();
    if (targets.length > 0) {
      this.targets = targets;
    } else {
      this.targets = getAllPackageTargets();
    }
    console.log('构建目标列表：', this.targets);
  }

  async build(target: string) {
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
    // 执行检查
    await execa('tsc', ['-p', resolve(pkgDir, 'tsconfig.json'), '--noEmit'], { stdio: 'inherit' });
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
}

new PackagesBuilder().run();
