/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-08-12 11:10:26
 * @FilePath      : /hh-lib/scripts/build-packages-doc-meta.ts
 */
import path from 'path';
import execa from 'execa';
import fs from 'fs-extra';
import { getTargets, getAllPackageTargets } from './common/target';
import BaseBuilder from './base-builder';

// 路径常量
const ROOT_DIR = path.resolve(__dirname, '../');
const resolve = (...args) => path.resolve(ROOT_DIR, ...args);

class PackagesDocMetaBuilder extends BaseBuilder {
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

  async build(target: string): Promise<any> {
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
}

new PackagesDocMetaBuilder().run();
