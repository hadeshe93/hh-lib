import merge from 'webpack-merge';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import { WebpackConfiguration } from '../../core/index';
import { findPresetConfigIndex } from '../../utils/babel';
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
      const BABEL_PRESET_TS = '@babel/preset-typescript';

      // 调整 @babel/preset-typescript 的配置
      const babelPresetTsIndex = findPresetConfigIndex(babelLoaderOptions.presets || [], BABEL_PRESET_TS);
      const babelPresetTs = babelPresetTsIndex > -1 ? babelLoaderOptions.presets[babelPresetTsIndex] : undefined;
      if (Array.isArray(babelPresetTs)) {
        babelPresetTs[1] = {
          ...(babelPresetTs[1] || {}),
          allExtensions: false,
        };
      }

      // 新增 @babel/preset-react，需要放到 @babel/preset-typescript 前
      const BABEL_PRESET_REACT = '@babel/preset-react';
      const presets = babelLoaderOptions.presets || [];
      if (babelPresetTsIndex === -1) {
        presets.push(BABEL_PRESET_REACT);
      } else {
        presets.splice(babelPresetTsIndex, 0, BABEL_PRESET_REACT);
      }
      babelLoaderOptions.presets = presets;
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
