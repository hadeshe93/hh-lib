import merge from 'webpack-merge';

import { getCommonConfig } from './common.config';
import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../types/configs';

/**
 * 获取开发环境配置
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options
 * @returns webpack 配置
 */
export async function getDevConfig(options: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
  const commonConfig = await getCommonConfig({
    mode: 'development',
    ...options,
  });
  return merge(commonConfig, {
    devServer: {
      hot: true,
      port: 3000,
    },
  });
}
