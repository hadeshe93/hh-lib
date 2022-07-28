import assert from 'assert';
import webpack from 'webpack';
import { resolve as pathResolve } from 'path';
import { getResolve } from '../utils/resolver';
import { generateStringTpl } from '../utils/template';
import { defaultWebpackPluginHook } from './common.config';
import { getProdDllOutputPath, getProdDllManifestOutputPath } from '../core/index';

import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../types/configs';

// 构建入口 map
// const ENTRY_MAP = {
//   'vue-stack': ['vue', 'vue-router', 'pinia'],
// };

/**
 * 获取生产环境使用的 Dll 构建配置
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options 配置参数
 * @returns 用户 webpack 配置
 */
export async function getProdDllConfig(options: Partial<OptionsForGetWebpackConfigs>): Promise<CustomedWebpackConfigs> {
  assertOptions(options);

  const { dllEntryMap, projectRootPath } = options;
  const resolve = getResolve(projectRootPath);
  const OUTPUT_PATH = getProdDllOutputPath({ resolve });
  const proxyCreatingPlugin = options.proxyCreatingPlugin ?? defaultWebpackPluginHook;

  return await {
    mode: 'production',
    entry: {
      ...(dllEntryMap || {}),
    },
    output: {
      clean: true,
      path: OUTPUT_PATH,
      library: '[name]_[hash:8]',
      filename: '[name]_[hash:8].js',
    },
    plugins: [
      await proxyCreatingPlugin(webpack.DllPlugin, [
        {
          name: '[name]_[hash:8]',
          path: getProdDllManifestOutputPath({ resolve }),
        },
      ]),
    ],
  };
}

/**
 * 获取 dll 文件名与路径的映射 map
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options 配置参数
 * @returns dll 文件名与路径的映射 map
 */
export function getDllFilePathMap(options: Partial<OptionsForGetWebpackConfigs>): Map<string, string> {
  assertOptions(options);

  const { dllEntryMap, projectRootPath } = options;
  const resolve = getResolve(projectRootPath);
  const OUTPUT_PATH = getProdDllOutputPath({ resolve });
  const keys = Object.keys(dllEntryMap || {});
  const map = new Map();
  const autoNameTpl = generateStringTpl('[name]');

  for (const key of keys) {
    const manifestJson = require(autoNameTpl(getProdDllManifestOutputPath({ resolve }), key));
    map.set(key, pathResolve(OUTPUT_PATH, `${manifestJson.name}.js`));
  }
  return map;
}

function assertOptions(options: Partial<OptionsForGetWebpackConfigs>) {
  const { dllEntryMap, projectRootPath } = options;
  const msgPrefix = '[dll config for weboack]';
  assert.ok(dllEntryMap, `${msgPrefix} dllEntryMap 无效`);
  assert.ok(projectRootPath, `${msgPrefix} projectRootPath 无效`);
}
