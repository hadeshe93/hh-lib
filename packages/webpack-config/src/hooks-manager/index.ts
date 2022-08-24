import type { Entry, Module, Cache, Stats } from 'webpack';
import { AsyncSeriesWaterfallHook, AsyncParallelHook } from 'tapable';
import { AsyncHooksManager } from '@hadeshe93/lib-node';
import {
  CustomedWebpackScene,
  BeforeNewPluginOptions,
  OptionsForGetWebpackConfigs,
  GetWebpackConfigs,
  WebpackManagerHookStartInfo,
} from '../typings/configs';
import type {
  CustomedWebpackConfigs,
  Outputs,
  Resolve,
  Optimization,
  Plugins,
  DevServer,
  DevTool,
  Target,
  Watch,
  WatchOptions,
  Externals,
  Performance,
  Node,
  CustomedWebpackConfigHooksPlugin,
} from '../typings/configs';

const logger = console;
const INNER_PLUGIN_NAME = 'WebpackConfigHookManager';
const HOOK_PARAM = 'value';

export type OptionsForRunWebpackConfigHookManager = {
  scene: CustomedWebpackScene;
  getDefaultConfig: GetWebpackConfigs;
  options: OptionsForGetWebpackConfigs;
};

export class WebpackConfigHookManager extends AsyncHooksManager {
  public hooks = {
    // 开始
    start: new AsyncParallelHook<WebpackManagerHookStartInfo>([HOOK_PARAM]),

    // 实例化插件之前的钩子
    beforeNewPlugin: new AsyncSeriesWaterfallHook<BeforeNewPluginOptions>([HOOK_PARAM]),

    // 处理 webpack 配置的前置钩子
    beforeMerge: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs>([HOOK_PARAM]),
    // 处理 webpack 配置的猴子钩子
    afterMerge: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs>([HOOK_PARAM]),

    // webpack 配置下的钩子
    context: new AsyncSeriesWaterfallHook<string>([HOOK_PARAM]),
    mode: new AsyncSeriesWaterfallHook<string>([HOOK_PARAM]),
    entry: new AsyncSeriesWaterfallHook<Entry>([HOOK_PARAM]),
    output: new AsyncSeriesWaterfallHook<Outputs>([HOOK_PARAM]),
    module: new AsyncSeriesWaterfallHook<Module>([HOOK_PARAM]),
    resolve: new AsyncSeriesWaterfallHook<Resolve>([HOOK_PARAM]),
    optimization: new AsyncSeriesWaterfallHook<Optimization>([HOOK_PARAM]),
    plugins: new AsyncSeriesWaterfallHook<Plugins>([HOOK_PARAM]),
    devServer: new AsyncSeriesWaterfallHook<DevServer>([HOOK_PARAM]),
    cache: new AsyncSeriesWaterfallHook<Cache>([HOOK_PARAM]),
    devtool: new AsyncSeriesWaterfallHook<DevTool>([HOOK_PARAM]),
    target: new AsyncSeriesWaterfallHook<Target>([HOOK_PARAM]),
    watch: new AsyncSeriesWaterfallHook<Watch>([HOOK_PARAM]),
    watchOptions: new AsyncSeriesWaterfallHook<WatchOptions>([HOOK_PARAM]),
    externals: new AsyncSeriesWaterfallHook<Externals>([HOOK_PARAM]),
    performance: new AsyncSeriesWaterfallHook<Performance>([HOOK_PARAM]),
    node: new AsyncSeriesWaterfallHook<Node>([HOOK_PARAM]),
    stats: new AsyncSeriesWaterfallHook<Stats>([HOOK_PARAM]),
  };
  public customedPlugins: CustomedWebpackConfigHooksPlugin[] = [];

  /**
   * 运行所有钩子，获取最终的配置
   *
   * @param {OptionsForRunWebpackConfigHookManager} optionsForRun
   * @returns webpack 配置
   * @memberof WebpackConfigHookManager
   */
  public async run(optionsForRun: OptionsForRunWebpackConfigHookManager): Promise<CustomedWebpackConfigs> {
    const { scene, getDefaultConfig, options } = optionsForRun;
    let webpackConfig;
    try {
      const { start, beforeNewPlugin, beforeMerge, afterMerge, ...otherHooks } = this.hooks;
      await start.promise({ scene });
      const defaultProxyCreatingPlugin = async (pluginClass, args) => {
        const options = await beforeNewPlugin.promise({ pluginClass, args });
        return Reflect.construct(options.pluginClass, options.args || []);
      };
      const defaultConfig = await getDefaultConfig({
        ...options,
        proxyCreatingPlugin: options.proxyCreatingPlugin ?? defaultProxyCreatingPlugin,
      });
      webpackConfig = defaultConfig;
      webpackConfig = await beforeMerge.promise(webpackConfig);
      for (const hookName of Object.keys(otherHooks || {})) {
        const value = await otherHooks[hookName].promise(webpackConfig[hookName]);
        const iSValueUneffective = value === undefined || value === null;
        if (iSValueUneffective) {
          delete webpackConfig[hookName];
        } else {
          webpackConfig[hookName] = value;
        }
      }
      webpackConfig = await afterMerge.promise(webpackConfig);
    } catch (err) {
      logger.error(`[${INNER_PLUGIN_NAME}] 运行 hooks 异常：`, err);
    }
    return webpackConfig;
  }
}
