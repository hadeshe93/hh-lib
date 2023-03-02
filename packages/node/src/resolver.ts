import { resolve as pathResolve } from 'path';
import findNodeModules from 'find-node-modules';

/**
 * 获取定制化的 resolve 方法
 *
 * @export
 * @param {string} projectPath
 * @returns 定制化的 resolve 方法
 */
export function getResolve(projectPath: string): (...pathnameList: string[]) => string {
  return (...pathnameList: string[]) => pathResolve(projectPath, ...pathnameList);
}

/**
 * 获取搜索 node_modules 的路径列表
 *
 * @export
 * @param {string[]} extraSearchList
 * @param {boolean} [replacePresets=false]
 * @returns {*}
 */
export function getNodeModulePaths(extraSearchList: string[] = [], replacePresets = false) {
  const pathListTofindModules = replacePresets
    ? extraSearchList || []
    : [...(extraSearchList || []), process.cwd(), __dirname, process.argv[0]];
  const nodeModulePaths = Array.from(
    new Set([].concat(...pathListTofindModules.map((cwd) => findNodeModules({ cwd, relative: false }) || []))),
  );
  return nodeModulePaths;
}

/**
 * 获取封装好的 requireResolve 方法
 *
 * @export
 * @param {string[]} nodeModulePaths
 * @returns {*}
 */
export function getRequireResolve(nodeModulePaths: string[]) {
  return (moduleName) =>
    require.resolve(moduleName, {
      paths: nodeModulePaths,
    });
}
