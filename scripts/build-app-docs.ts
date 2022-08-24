/*
 * @Description   : 构建脚本
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-08-12 12:32:11
 * @FilePath      : /hh-lib/scripts/build-app-docs.ts
 */
import path from 'path';
import glob from 'glob';
import execa from 'execa';
import fs from 'fs-extra';
import { getTargets, getAllPackageTargets } from './common/target';
import BaseBuilder from './base-builder';

// 路径常量
const ROOT_DIR = path.resolve(__dirname, '../');
const resolve = (...args) => path.resolve(ROOT_DIR, ...args);

class AppDocsBuilder extends BaseBuilder {
  apiDocDestPath = '';
  apiDocDestTempPath = '';
  tempApiJsonHubPath = '';

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

  async begin() {
    this.apiDocDestPath = resolve('apps/docs/docs/');
    this.apiDocDestTempPath = resolve('apps/docs/.temp-docs/');
    this.tempApiJsonHubPath = resolve(`apps/docs/.temp/`);

    await Promise.all([
      fs.ensureDir(this.apiDocDestPath),
      fs.emptyDir(this.apiDocDestTempPath),
      fs.ensureDir(this.tempApiJsonHubPath),
    ]);
  }

  // 将所有包的 *.api.json 产物全部拷贝到 apps/docs 里面去
  async build(target: string): Promise<any> {
    const pkgDir = resolve(`packages/${target}`);
    const apiTempReportSrcPath = path.resolve(pkgDir, './dist-temp-api-report/');
    if (!(await fs.pathExists(apiTempReportSrcPath))) return;

    let apiJsonList = [];
    apiJsonList = await new Promise((resolve, reject) => {
      glob(path.join(apiTempReportSrcPath, '*.api.json'), {}, (err, matches) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(matches);
      });
    });
    await Promise.all(
      apiJsonList.map((apiJsonFilePath) => {
        const tempApiJsonFilePath = path.resolve(this.tempApiJsonHubPath, path.basename(apiJsonFilePath));
        return fs.copy(apiJsonFilePath, tempApiJsonFilePath, { overwrite: true });
      }),
    );
  }

  async buildAll(targets: string[]): Promise<any> {
    // 执行并行产物构建
    await super.buildAll.call(this, targets);

    // 会清空掉输出目录，所以先生成到临时目录
    await execa('api-documenter', ['markdown', '-i', this.tempApiJsonHubPath, '-o', this.apiDocDestTempPath], {
      stdio: 'inherit',
    });
    // 然后清空掉原目录下的 md 文档
    if (fs.pathExists(path.resolve(this.apiDocDestPath, './index.md'))) {
      console.log(`${this.apiDocDestPath} 存在 md 文档，进行删除`);
      await execa('rm', ['-f', `${this.apiDocDestPath}/*.md`], { stdio: 'inherit' });
    }
    // 最后将生成的文档从临时目录拷贝回来
    await execa('cp', ['-r', `${this.apiDocDestTempPath}/.`, `${this.apiDocDestPath}/`], { stdio: 'inherit' });
  }
}

new AppDocsBuilder().run();
