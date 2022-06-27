import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const PROJECT_ROOT_PATH = path.resolve(dirname, '../../');

export function rootResolve(...paths) {
  return path.resolve(PROJECT_ROOT_PATH, ...paths);
}

export function getPkgResolve(pkgPath) {
  return (p) => rootResolve('packages', pkgPath, p);
}
