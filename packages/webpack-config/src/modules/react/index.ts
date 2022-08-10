import merge from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import { WebpackConfiguration } from '../../core/index';
import { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';
import { CommonConfig } from '../common';

export class ReactConfig extends WebpackConfiguration {
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

  private async getCustomedMergedConfig(rawDefaultConfig: CustomedWebpackConfigs): Promise<CustomedWebpackConfigs> {
    const defaultConfig = merge({}, rawDefaultConfig);
    const moduleRules = defaultConfig?.module?.rules || [];
    const scriptRule = moduleRules.find((rule) => {
      console.log('rule: ', rule);
      console.log('rule test result: ', rule['test']?.test?.('.jsx'));
      return rule['test']?.test?.('.jsx');
    });
    if (scriptRule) {
      const babelLoaderUse = scriptRule['use'].find((useItem) => useItem.loader === 'babel-loader');
      const babelLoaderOptions = babelLoaderUse?.options || {};
      babelLoaderOptions.presets = [...(babelLoaderOptions.presets || []), '@babel/preset-react'];
      babelLoaderOptions.plugins = [...(babelLoaderOptions.plugins || []), require.resolve('react-refresh/babel')];
    }

    if (defaultConfig?.plugins) {
      defaultConfig.plugins.push(
        new ReactRefreshWebpackPlugin({
          overlay: false,
        }),
      );
    }
    return defaultConfig;
  }

  public async getDevConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    const devConfig = await new CommonConfig().getDevConfig(options);
    return this.getCustomedMergedConfig(devConfig);
  }

  public async getProdConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    const prodConfig = await new CommonConfig().getProdConfig(options);
    return this.getCustomedMergedConfig(prodConfig);
  }

  public async getProdDllConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    const prodConfig = await new CommonConfig().getProdDllConfig(options);
    return prodConfig;
  }
}
