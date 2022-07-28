import fs from 'fs-extra';
import { getTypeOf } from '@hadeshe93/lib-common';
import { ViceConfigs } from '../types/vice-configs';

let userViceConfigs;
/**
 * 获取用户的 vice 配置
 *
 * @export
 * @param {string} configFilePath
 * @param {boolean} [forceRefresh=false]
 * @returns 用户的 vice 配置
 */
export function getUserViceConfigs(configFilePath: string, forceRefresh = false): ViceConfigs {
  if (userViceConfigs && !forceRefresh) return userViceConfigs;
  if (!fs.pathExistsSync(configFilePath)) throw new Error(`指定路径 ${configFilePath} 下的 vice 配置文件不存在`);
  userViceConfigs = formatViceConfigs(require(configFilePath));
  return userViceConfigs;
}

/**
 * 格式化 vice configs
 *
 * @export
 * @param {ViceConfigs} rawViceConfigs
 * @returns 格式化好的 vice configs
 */
export function formatViceConfigs(rawViceConfigs: ViceConfigs): ViceConfigs {
  const { page = {}, build = {}, plugins = {} } = rawViceConfigs || {};
  return {
    page: {
      title: '',
      description: '',
      useFlexible: true,
      useDebugger: false,
      ...(page || {}),
    },
    build: {
      dllEntryMap: false,
      ...(build || {}),
    },
    plugins: {
      ...(plugins || {}),
    },
  };
}

export function getDllEntryMap(rawViceConfigs: ViceConfigs) {
  const { build = {} } = formatViceConfigs(rawViceConfigs);
  if (!Object.prototype.hasOwnProperty.call(build, 'dllEntryMap')) return false;
  const typeVal = getTypeOf(build.dllEntryMap);
  if (typeVal === 'undefined' || typeVal === 'null' || !build.dllEntryMap) return false;
  if (typeVal !== 'object' || Object.keys(build.dllEntryMap).length === 0) return false;
  return build.dllEntryMap;
}
