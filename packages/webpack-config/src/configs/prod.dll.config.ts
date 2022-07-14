import webpack from 'webpack';
import { resolve as pathResolve } from 'path';
import { getResolve } from '../utils/resolver';
import type { GetConfigOptions, CustomedWebpackConfigs } from '../types/configs';

// 构建入口 map
const ENTRY_MAP = {
  'vue-stack': ['vue', 'vue-router', 'pinia'],
};

/**
 * 获取构建产物目录
 *
 * @export
 * @param {GetConfigOptions} options 配置参数
 * @returns dll 构建产物的输出目录
 */
export function getProdDllOutputPath(options: GetConfigOptions) {
  const resolve = getResolve(options.projectRootPath);
  return resolve('dist/common/');
}

/**
 * 获取生产环境使用的 Dll 构建配置
 *
 * @export
 * @param {GetConfigOptions} options 配置参数
 * @returns 用户 webpack 配置
 */
export function getProdDllConfig(options: GetConfigOptions): CustomedWebpackConfigs {
  const OUTPUT_PATH = getProdDllOutputPath(options);
  return {
    mode: 'production',
    entry: {
      ...ENTRY_MAP,
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
 * @param {GetConfigOptions} options 配置参数
 * @returns dll 文件名与路径的映射 map
 */
export function getDllFilePathMap(options: GetConfigOptions): Map<string, string> {
  const OUTPUT_PATH = getProdDllOutputPath(options);
  const keys = Object.keys(ENTRY_MAP);
  const map = new Map();
  for (const key of keys) {
    const manifestJson = require(pathResolve(OUTPUT_PATH, `${key}.mainifest.json`));
    map.set(key, pathResolve(OUTPUT_PATH, `${manifestJson.name}.js`));
  }
  return map;
}
