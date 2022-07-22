import webpack from 'webpack';
import { resolve as pathResolve } from 'path';
import { getResolve } from '../utils/resolver';
import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../types/configs';

// 构建入口 map
// const ENTRY_MAP = {
//   'vue-stack': ['vue', 'vue-router', 'pinia'],
// };

/**
 * 获取构建产物目录
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options 配置参数
 * @returns dll 构建产物的输出目录
 */
export function getProdDllOutputPath(options: OptionsForGetWebpackConfigs) {
  const resolve = getResolve(options.projectRootPath);
  return resolve('dist/common/');
}

/**
 * 获取生产环境使用的 Dll 构建配置
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options 配置参数
 * @returns 用户 webpack 配置
 */
export async function getProdDllConfig(options: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
  const { dllEntryMap = {} } = options;
  const OUTPUT_PATH = getProdDllOutputPath(options);
  return await {
    mode: 'production',
    entry: {
      ...(dllEntryMap || {}),
    },
    output: {
      path: OUTPUT_PATH,
      filename: '[name]_[hash:8].js',
    },
    plugins: [
      new webpack.DllPlugin({
        name: '[name]_[hash:8]',
        path: pathResolve(OUTPUT_PATH, '[name].mainifest.json'),
      }),
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
export function getDllFilePathMap(options: OptionsForGetWebpackConfigs): Map<string, string> {
  const { dllEntryMap = {} } = options;
  const OUTPUT_PATH = getProdDllOutputPath(options);
  const keys = Object.keys(dllEntryMap || {});
  const map = new Map();
  for (const key of keys) {
    const manifestJson = require(pathResolve(OUTPUT_PATH, `${key}.mainifest.json`));
    map.set(key, pathResolve(OUTPUT_PATH, `${manifestJson.name}.js`));
  }
  return map;
}
