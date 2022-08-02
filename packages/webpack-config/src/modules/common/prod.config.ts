import merge from 'webpack-merge';

import { getCommonConfig } from './common.config';
import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';

/**
 * 获取生成环境配置
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options
 * @returns webpack 配置
 */
export async function getProdConfig(options: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
  const commonConfig = await getCommonConfig({
    mode: 'production',
    ...options,
  });

  return merge(commonConfig, {
    output: {
      clean: true,
    },
  });
}
