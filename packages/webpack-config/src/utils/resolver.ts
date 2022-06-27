import { resolve as pathResolve } from 'path';

export function getResolve(projectRootPath: string) {
  return (pathname: string) => pathResolve(projectRootPath, pathname);
}
