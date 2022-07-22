import path from 'path';
import fs from 'fs-extra';

let projectRootPath = '';

/**
 * 获取开发的项目所在的路径
 *
 * @export
 * @returns 开发的项目所在的路径
 */
export function getProjectRootPath(): string {
  if (!projectRootPath) return setProjectRootPath();
  return projectRootPath;
}

/**
 * 设置开发的项目所在的路径
 *
 * @export
 * @param {string} [rawProjectRootPath=''] 指定的开发项目所在的路径
 * @returns 开发的项目所在的路径
 */
function setProjectRootPath(rawProjectRootPath = ''): string {
  if (rawProjectRootPath && typeof rawProjectRootPath === 'string') {
    projectRootPath = rawProjectRootPath;
    return projectRootPath;
  }

  const cwd = process.cwd();
  if (fs.pathExistsSync(path.resolve(cwd, './src/pages'))) {
    projectRootPath = cwd;
    return projectRootPath;
  }

  const rootPath = path.resolve(cwd, '../../../');
  if (!fs.pathExistsSync(path.resolve(rootPath, 'pages'))) {
    projectRootPath = '';
  } else {
    projectRootPath = rootPath;
  }
  return projectRootPath;
}
