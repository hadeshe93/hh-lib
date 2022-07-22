import os from 'os';
import path from 'path';

/**
 * 获取 vice-cli 用户配置目录路径
 *
 * @export
 * @returns 路径字符串
 */
export function getViceCliUserConfigDir(): string {
  return path.resolve(os.homedir(), '.vice/');
}

/**
 * 获取 vice-cli 用户配置目录下的 templates 目录路径
 *
 * @export
 * @returns 路径字符串
 */
export function getViceCliTplsUserConfigDir(): string {
  return path.resolve(getViceCliUserConfigDir(), 'templates/');
}
