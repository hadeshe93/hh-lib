import { resolve as pathResolve } from 'path';

/**
 * 获取定制化的 resolve 方法
 *
 * @export
 * @param {string} projectRootPath
 * @returns 定制化的 resolve 方法
 */
export function getResolve(projectRootPath: string): (pathname: string) => string {
  return (pathname: string) => pathResolve(projectRootPath, pathname);
}
