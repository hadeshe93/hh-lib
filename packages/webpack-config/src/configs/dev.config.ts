import merge from 'webpack-merge';

import { getCommonConfig } from './common.config';
import type { GetConfigOptions, CustomedWebpackConfigs } from '../types/configs';

export function getDevConfig(options: GetConfigOptions): CustomedWebpackConfigs {
  const commonConfig = getCommonConfig({
    ...options,
    mode: 'development',
  });
  return merge(commonConfig, {
    devServer: {
      hot: true,
      port: 3000,
    },
  });
}
