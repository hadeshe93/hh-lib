import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { CustomedPlugin } from '@hadeshe93/lib-node';
import { CustomedWebpackConfigs } from '@hadeshe93/webpack-config';
import { WebpackConfigHookManager } from '@hadeshe93/webpack-config';
import type { OptionsForRunWebpackConfigHookManager } from '@hadeshe93/webpack-config';

import logger from '../../libs/logger';
import { getInternalWebpackConfigHooksPlugin } from './config-hooks/internal';

import type { ViceConfigs } from '../../../types/vice-configs';
import type { DevOptions, DevReuslt, BuildOptions, BuildReuslt } from './type';

interface OptionsForGetCustomedPlugin {
  viceConfigs: ViceConfigs;
}
export function getCustomedPlugin(options: OptionsForGetCustomedPlugin): CustomedPlugin {
  return {
    pluginName: 'customedPlugin',
    hooks: {
      async dev(devOptions: DevOptions): Promise<DevReuslt> {
        const { pageName, optionsForRun } = devOptions;
        pageName && logger(`开始调试 ${pageName} 页面`);

        // 读取配置
        const userViceConfigs = options.viceConfigs;
        const webpackConfigs = await generateWebpackConfigsFromViceConfigs(userViceConfigs, optionsForRun);

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
        const { pageName, optionsForRun: rawOptionsForRun } = buildOptions;
        pageName && logger(`开始构建 ${pageName} 页面`);

        // 读取配置
        const userViceConfigs = options.viceConfigs;
        const optionsForRun = Array.isArray(rawOptionsForRun) ? rawOptionsForRun : [rawOptionsForRun];

        // 多项构建配置，串行执行
        for (const opt of optionsForRun) {
          const webpackConfigs = await generateWebpackConfigsFromViceConfigs(userViceConfigs, opt);
          try {
            console.log('===> webpackConfigs:', webpackConfigs);
            await doBuild(webpackConfigs);
          } catch (err) {
            return {
              isSuccess: false,
              message: err.toString(),
              options: buildOptions,
            };
          }
        }

        // 多项构建配置，串行执行
        // for (const configs of webpackConfigs as CustomedWebpackConfigs[]) {
        //   try {
        //     await doBuild(configs);
        //   } catch (err) {
        //     return {
        //       isSuccess: false,
        //       message: err.toString(),
        //       options: buildOptions,
        //     };
        //   }
        // }
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

/**
 * 从用户自定义 hooks 中生成 webpack 配置
 *
 * @param {ViceConfigs} webpackConfigHooks
 * @param {OptionsForRunWebpackConfigHookManager} optionsForRun
 * @returns webpack 配置
 */
async function generateWebpackConfigsFromViceConfigs(
  viceConfigs: ViceConfigs,
  optionsForRun: OptionsForRunWebpackConfigHookManager,
): Promise<CustomedWebpackConfigs> {
  const webpackConfigs = await (async () => {
    let webpackConfigHookManager = new WebpackConfigHookManager();
    const { projectRootPath } = optionsForRun.options;
    // 处理预设相关的用户配置
    const internalWebpackConfigHooksPlugin = getInternalWebpackConfigHooksPlugin({ projectRootPath, viceConfigs });

    // 处理用户配置的钩子
    const { webpackConfigHooks: rawWebpackConfigHooks } = viceConfigs.plugins || {};
    const userWebpackConfigHooks = Array.isArray(rawWebpackConfigHooks)
      ? rawWebpackConfigHooks
      : rawWebpackConfigHooks
      ? [rawWebpackConfigHooks]
      : [];
    const webpackConfigHooks = [internalWebpackConfigHooksPlugin].concat(userWebpackConfigHooks);
    for (const hooksPlugin of webpackConfigHooks) {
      await webpackConfigHookManager.loadPlugin('', async () => hooksPlugin);
    }
    const configs = webpackConfigHookManager.run(optionsForRun);
    webpackConfigHookManager = undefined;
    return configs;
  })();
  return webpackConfigs;
}
