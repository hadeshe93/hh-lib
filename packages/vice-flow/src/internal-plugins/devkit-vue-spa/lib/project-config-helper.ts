import fs from 'fs-extra';
import { getTypeOf } from '@hadeshe93/lib-common';
import {
  CustomedWebpackConfigs,
  CustomedWebpackConfigHooksPlugin,
  OptionsForRunWebpackConfigHookManager,
  WebpackConfigHookManager,
} from '@hadeshe93/webpack-config';
import { WebpackProjectConfigs } from '../types/config';
import { BaseProjectConfigHelper, ProjectConfigHelperCtx } from './base-project-config-helper';
import { getInternalWebpackConfigHooksPlugin } from '../webpack-config/internal-hook-plugin';

export { ProjectConfigHelperCtx };

export class ProjectConfigHelper extends BaseProjectConfigHelper<WebpackProjectConfigs, CustomedWebpackConfigs> {
  projectConfig: WebpackProjectConfigs;

  async parse(forceRefresh = false) {
    if (this.projectConfig && !forceRefresh) return this.projectConfig;
    const { configFilePath = '' } = this.ctx || {};
    if (!fs.pathExistsSync(configFilePath)) {
      // throw new Error(`Project config file at ${configFilePath} doesn't exist.`);
      return getDefaultProjectConfig();
    }
    return require(configFilePath);
  }

  async transform(rawProjectConfig: WebpackProjectConfigs): Promise<WebpackProjectConfigs> {
    const defaultConfig = getDefaultProjectConfig();
    const { page = {}, build = {}, plugins = {} } = rawProjectConfig || {};
    const { dllEntryMap: rawDllEntryMap } = build || {};
    const dllEntryMap = formatDllEntryMap(rawDllEntryMap);
    this.projectConfig = {
      page: {
        ...defaultConfig.page,
        ...(page || {}),
      },
      build: {
        ...defaultConfig.build,
        ...(build || {}),
        dllEntryMap,
      },
      plugins: {
        ...defaultConfig.plugins,
        ...(plugins || {}),
      },
    };
    return this.projectConfig;
  }

  async generate(
    transformedConfig: WebpackProjectConfigs,
    extraOptions: OptionsForRunWebpackConfigHookManager,
  ): Promise<CustomedWebpackConfigs | undefined> {
    if (extraOptions.scene === 'buildDll' && !transformedConfig.build.dllEntryMap) {
      return undefined;
    }

    // 查找用户自定义钩子
    const { plugins } = transformedConfig;
    const { webpackConfigHooks: rawWebpackConfigHooks } = plugins || {};
    const webpackHookManager = new WebpackConfigHookManager();
    const webpackConfigHooks = (
      rawWebpackConfigHooks && Array.isArray(rawWebpackConfigHooks) ? rawWebpackConfigHooks : [rawWebpackConfigHooks]
    ).filter((hook) => !!hook);

    // 补充 unshift 内置钩子
    webpackConfigHooks.unshift(
      getInternalWebpackConfigHooksPlugin({
        webpackProjectConfigs: transformedConfig,
      }),
    );

    // 加载钩子插件进 manager
    for (const hook of webpackConfigHooks) {
      await webpackHookManager.loadPlugin('', async () => hook as CustomedWebpackConfigHooksPlugin);
    }

    // 运行钩子，获得最终 webpack 的构建配置
    return await webpackHookManager.run(extraOptions);
  }
}

/**
 * 格式化 dllEntryMap 选项
 *
 * @param {*} dllEntryMap
 * @returns dllEntryMap
 */
function formatDllEntryMap(dllEntryMap: any): Record<string, any> | false {
  const typeVal = getTypeOf(dllEntryMap);
  if (typeVal === 'undefined' || typeVal === 'null' || !dllEntryMap) return false;
  if (typeVal !== 'object' || Object.keys(dllEntryMap).length === 0) return false;
  return dllEntryMap;
}

/**
 * 获取默认的项目配置
 *
 * @returns {*}  {WebpackProjectConfigs}
 */
function getDefaultProjectConfig(): WebpackProjectConfigs {
  return {
    page: {
      title: 'Default Title',
      description: 'Default Description',
      useFlexible: true,
      useDebugger: true,
      pxtoremOptions: {
        rootValue: 75,
        propList: ['*'],
        unitPrecision: 6,
      },
    },
    build: {
      dllEntryMap: false,
    },
    plugins: {
      webpackConfigHooks: [],
    },
  };
}
