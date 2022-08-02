import assert from 'assert';
import webpack from 'webpack';
import { getResolve } from '../../utils/resolver';
import { defaultWebpackPluginHook } from '../../utils/plugin';
import { getProdDllOutputPath, getProdDllManifestOutputPath } from '../../core/index';

import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';

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

function assertOptions(options: Partial<OptionsForGetWebpackConfigs>) {
  const { dllEntryMap, projectRootPath } = options;
  const msgPrefix = '[dll config for weboack]';
  assert.ok(dllEntryMap, `${msgPrefix} dllEntryMap 无效`);
  assert.ok(projectRootPath, `${msgPrefix} projectRootPath 无效`);
}
