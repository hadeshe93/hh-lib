import merge from 'webpack-merge';
import { VueLoaderPlugin } from 'vue-loader';
import { defaultWebpackPluginHook } from '../../utils/plugin';

import { WebpackConfiguration } from '../../core/index';
import { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';
import { CommonConfig } from '../common';

export class VueConfig extends WebpackConfiguration {
  options: OptionsForGetWebpackConfigs = {
    projectRootPath: process.cwd(),
    pageName: '',
  };

  constructor(options?: OptionsForGetWebpackConfigs) {
    super();
    if (options) {
      this.options = options;
    }
  }

  private async getVueExtraConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    const proxyCreatingPlugin = options.proxyCreatingPlugin ?? defaultWebpackPluginHook;
    return {
      module: {
        rules: [{ test: /\.vue$/, loader: 'vue-loader' }],
      },
      plugins: [await proxyCreatingPlugin(VueLoaderPlugin, [])],
    };
  }

  public async getDevConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    const devConfig = await new CommonConfig().getDevConfig(options);
    return merge(await this.getVueExtraConfig(options), devConfig);
  }

  public async getProdConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    const prodConfig = await new CommonConfig().getProdConfig(options);
    return merge(await this.getVueExtraConfig(options), prodConfig);
  }
}
