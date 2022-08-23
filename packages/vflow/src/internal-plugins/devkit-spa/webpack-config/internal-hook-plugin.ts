import type { RuleSetRule } from 'webpack';
import type { CustomedWebpackConfigHooksPlugin } from '@hadeshe93/webpack-config';

import webpackBundleAnalyzer, { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { OptionsForGetInternalPlugin } from '../types/plugin';
import { HtmlInjectionPlugin } from '../webpack-plugins/html-injection-plugin';

export function getInternalWebpackConfigHooksPlugin(
  options: OptionsForGetInternalPlugin,
): CustomedWebpackConfigHooksPlugin {
  const { webpackProjectConfigs } = options;
  let scene = '';
  return {
    pluginName: 'InternalWebpackConfigHooksPlugin',
    hooks: {
      async start({ scene: rawScene }) {
        scene = rawScene;
      },
      async beforeNewPlugin(options) {
        if (scene === 'buildDll') return options;

        if (options.pluginClass.name === 'HtmlWebpackPlugin') {
          const [pluginOpts] = options.args;
          const { title = '', description = '' } = webpackProjectConfigs.page || {};
          pluginOpts.title = title || '';
          pluginOpts.description = description || '';
        }
        return options;
      },
      async module(module) {
        if (scene === 'buildDll') return module;
        if (!webpackProjectConfigs.page.useFlexible) return module;

        // 给 postcss-loader 添加进 postcss-pxtorem 插件
        const { rules = [] } = module;
        const styleFileExtensions = ['.css', '.less', '.sass', '.scss'].concat([
          '.module.css',
          '.module.less',
          '.module.sass',
          '.module.scss',
        ]);
        const targetRules = rules.filter(
          (rule: RuleSetRule) => !!styleFileExtensions.find((ext) => (rule.test as RegExp)?.test?.(ext)),
        );
        const postcssLoaderConfigs = targetRules.reduce((list, rule: RuleSetRule) => {
          const { use } = rule;
          const postcssLoaderConfig = (use as Array<any>).find((loaderConfig) => {
            const isPlainObject = Object.prototype.toString.call(loaderConfig) === '[object Object]';
            const isPostcssLoader = loaderConfig.loader === 'postcss-loader';
            return isPlainObject && isPostcssLoader;
          });
          if (postcssLoaderConfig) list.push(postcssLoaderConfig);
          return list;
        }, []);
        postcssLoaderConfigs.forEach((config) => {
          const { plugins = [] } = config.options.postcssOptions || {};
          const targetPluginName = 'postcss-pxtorem';
          const px2RemPluginIndex = plugins.findIndex((plugin) => {
            if (typeof plugin === 'string' && plugin === targetPluginName) {
              return true;
            }
            if (Array.isArray(plugin) && plugin[0] === targetPluginName) {
              return true;
            }
            return false;
          });
          const targetPlugin = [
            targetPluginName,
            {
              ...(webpackProjectConfigs.page.pxtoremOptions || {}),
            },
          ];
          if (px2RemPluginIndex > -1) {
            plugins.splice(px2RemPluginIndex, 1, targetPlugin);
          } else {
            plugins.push(targetPlugin);
          }
        });
        return module;
      },
      async plugins(plugins) {
        if (scene !== 'buildDll') {
          const { useDebugger, useFlexible } = webpackProjectConfigs.page;
          plugins.push(
            new HtmlInjectionPlugin({
              useDebugger,
              useFlexible,
            }),
          );
        }

        const { useBundleAnalyzer } = webpackProjectConfigs.build;
        if (scene === 'build' && useBundleAnalyzer) {
          const options = (
            Object.prototype.toString.call(useBundleAnalyzer) === '[object Object]' ? useBundleAnalyzer : {}
          ) as BundleAnalyzerPlugin.Options;
          plugins.push(new webpackBundleAnalyzer.BundleAnalyzerPlugin(options));
        }
        return plugins;
      },
    },
  };
}