import merge from 'webpack-merge';

import { getResolve } from '../utils/resolver';
import { getCommonConfig } from './common.config';
import type { GetConfigOptions, CustomedWebpackConfigs } from '../types/configs';

export function getProdConfig(options: GetConfigOptions): CustomedWebpackConfigs {
  const resolve = getResolve(options.projectRootPath);
  const commonConfig = getCommonConfig({
    ...options,
    mode: 'production',
  });

  return merge(commonConfig, {
    output: {
      clean: true,
      path: resolve('dist/assets'),
    },
  });
}
