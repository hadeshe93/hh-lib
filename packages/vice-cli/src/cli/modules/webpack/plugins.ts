import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { CustomedPlugin } from '@hadeshe93/lib-node';
import { CustomedWebpackConfigs } from '@hadeshe93/webpack-config';
import { WebpackConfigHookManager } from '@hadeshe93/webpack-config';
import type {
  CustomedWebpackConfigHooksPlugin,
  OptionsForRunWebpackConfigHookManager,
} from '@hadeshe93/webpack-config';

import logger from '../../libs/logger';
import { getProjectRootPath } from './utils';
import { loadUserViceConfigs } from './configs';
import type { ViceConfigs } from '../../../types/vice-configs';
import type { DevOptions, DevReuslt, BuildOptions, BuildReuslt } from './type';

export function getCustomedPlugin(): CustomedPlugin {
  return {
    pluginName: 'customedPlugin',
    hooks: {
      async dev(devOptions: DevOptions): Promise<DevReuslt> {
        const { pageName, optionsForRun } = devOptions;
        pageName && logger(`开始调试 ${pageName} 页面`);

        // 读取配置
        const userViceConfigs = getUserViceConfigs({ pageName });
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
        const userViceConfigs = getUserViceConfigs({ pageName });
        const optionsForRun = Array.isArray(rawOptionsForRun) ? rawOptionsForRun : [rawOptionsForRun];
        const webpackConfigs = [];
        for (const opt of optionsForRun) {
          webpackConfigs.push(await generateWebpackConfigsFromViceConfigs(userViceConfigs, opt));
        }

        // 多项构建配置，串行执行
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

type OptionsForGetUserViceConfigs = {
  pageName: string;
  forceRefresh?: boolean;
};
let userViceConfigs;
/**
 * 获取用户的 vice 配置
 *
 * @returns 用户的 vice 配置
 */
function getUserViceConfigs(options: OptionsForGetUserViceConfigs) {
  if (!options.forceRefresh && userViceConfigs) return userViceConfigs;

  userViceConfigs = loadUserViceConfigs(
    path.resolve(getProjectRootPath(), `src/pages/${options.pageName}/vice.config.js`),
  );
  return userViceConfigs;
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
    // 处理预设相关的用户配置
    const internalWebpackConfigHookPlugin: CustomedWebpackConfigHooksPlugin = (() => {
      let scene = '';
      return {
        pluginName: 'InternalWebpackConfigHookPlugin',
        hooks: {
          async start({ scene: rawScene }) {
            scene = rawScene;
          },
          async beforeNewPlugin(options) {
            console.log('options.pluginClass: ', options.pluginClass.name);
            if (options.pluginClass.name === 'HtmlWebpackPlugin') {
              const [pluginOpts] = options.args;
              const { title = '', description = '' } = viceConfigs.page || {};
              pluginOpts.title = title || '';
              pluginOpts.description = description || '';
            }
            return options;
          },
        },
      };
    })();

    // 处理用户配置的钩子
    const { webpackConfigHooks: rawWebpackConfigHooks } = viceConfigs.plugins || {};
    const userWebpackConfigHooks = Array.isArray(rawWebpackConfigHooks)
      ? rawWebpackConfigHooks
      : rawWebpackConfigHooks
      ? [rawWebpackConfigHooks]
      : [];
    const webpackConfigHooks = [internalWebpackConfigHookPlugin].concat(userWebpackConfigHooks);
    for (const hooksPlugin of webpackConfigHooks) {
      await webpackConfigHookManager.loadPlugin('', async () => hooksPlugin);
    }
    const configs = webpackConfigHookManager.run(optionsForRun);
    webpackConfigHookManager = undefined;
    return configs;
  })();
  return webpackConfigs;
}
