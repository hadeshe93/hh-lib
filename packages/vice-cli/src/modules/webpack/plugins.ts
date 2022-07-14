import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { CustomedPlugin } from '@hadeshe93/lib-node';
import { CustomedWebpackConfigs } from '@hadeshe93/webpack-config';

import logger from '../../libs/logger';
import type { DevOptions, DevReuslt, BuildOptions, BuildReuslt } from './type';

export function getCustomedPlugin(): CustomedPlugin {
  return {
    pluginName: 'customedPlugin',
    hooks: {
      async dev(devOptions: DevOptions): Promise<DevReuslt> {
        const { pageName, webpackConfigs } = devOptions;
        pageName && logger(`开始调试 ${pageName} 页面`);

        let isSuccess = true;
        let message = '';
        try {
          await doDev(webpackConfigs);
        } catch (err) {
          isSuccess = false;
          message = err.toString();
        }
        return {
          isSuccess,
          message,
          options: devOptions,
        };
      },
      async build(buildOptions: BuildOptions): Promise<BuildReuslt> {
        const { pageName, webpackConfigs: rawWebpackConfigs } = buildOptions;
        pageName && logger(`开始构建 ${pageName} 页面`);

        // 多项构建配置，串行执行
        let webpackConfigs = rawWebpackConfigs;
        if (!Array.isArray(rawWebpackConfigs)) {
          webpackConfigs = [rawWebpackConfigs];
        }
        for (const configs of webpackConfigs as CustomedWebpackConfigs[]) {
          try {
            await doBuild(configs);
          } catch (err) {
            return {
              isSuccess: false,
              message: err.toString(),
              options: buildOptions,
            };
          }
        }
        return {
          isSuccess: true,
          message: '',
          options: buildOptions,
        };
      },
    },
  };
}

/**
 * 执行 webpack 的单项构建
 *
 * @param {CustomedWebpackConfigs} webpackConfigs
 * @returns any
 */
function doBuild(webpackConfigs: CustomedWebpackConfigs): Promise<any> {
  return new Promise((resolve, reject) => {
    webpack(webpackConfigs, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        reject(err);
        return;
      }
      if (stats.hasErrors()) {
        const errors = stats.toJson().errors;
        console.error(errors);
        reject(errors);
        return;
      }
      console.log(
        stats.toString({
          colors: true,
        }),
      );
      resolve(stats);
    });
  });
}

/**
 * 执行 webpack 的单项调试
 *
 * @param {CustomedWebpackConfigs} webpackConfigs
 * @returns {*}  {Promise<void>}
 */
function doDev(webpackConfigs: CustomedWebpackConfigs): Promise<void> {
  const compiler = webpack(webpackConfigs);
  const devServerOptions = { ...webpackConfigs.devServer, open: false };
  const server = new WebpackDevServer(devServerOptions, compiler);
  return server.start();
}
