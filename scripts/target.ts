import fs from 'fs';
import minimist from 'minimist';

/**
 * 获取所有可以被构建的 packages
 *
 * @export
 * @return {*}  {string[]}
 */
export function getAllTargets(): string[] {
  return fs.readdirSync('packages').filter((f) => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
      return false;
    }
    const pkg = require(`../packages/${f}/package.json`);
    if (pkg.private || !pkg.buildOptions) {
      return false;
    }
    return true;
  });
}

/**
 * 获取命令行指定要构建的 package
 *
 * @export
 * @return {*}  {string[]}
 */
export function getTargets(): string[] {
  return minimist(process.argv.slice(2))._;
}
