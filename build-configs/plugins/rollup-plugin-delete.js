import fs from 'fs-extra';
import glob from 'glob';

/**
 * rollup 用的删除插件
 *
 * @export
 * @param {*} [options={}]
 * @returns {*} 返回插件相关的配置
 */
export function rollupPluginDelete(options = {}) {
  const { pre, post } = options || {};
  const removeTarget = (targetPath) => {
    if (!fs.pathExistsSync(targetPath)) {
      return;
    }
    fs.removeSync(targetPath);
  };
  const batchRemove = (options = {}) => {
    const { globPattern } = options || {};
    if (!globPattern) return;
    const result = glob.sync(globPattern);
    result.forEach((filePath) => {
      removeTarget(filePath);
    });
  };

  return {
    name: 'rollup-plugin-delete',
    options() {
      batchRemove(pre);
    },
    writeBundle() {
      batchRemove(post);
    },
  };
}
