import type { Entry, Module, Cache, Stats } from 'webpack';
import { AsyncSeriesWaterfallHook } from 'tapable';
import { AsyncHooksManager } from '@hadeshe93/lib-node';
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
} from '../types/configs';

const logger = console;
const INNER_PLUGIN_NAME = 'WebpackConfigHookManager';
const HOOK_PARAM = 'value';

class WebpackConfigHookManager extends AsyncHooksManager {
  public hooks = {
    // 全局前置钩子
    beforeAll: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs>([HOOK_PARAM]),
    // 全局后置钩子
    afterAll: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs>([HOOK_PARAM]),

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
  public customedPlugins = [];

  /**
   * 运行所有钩子，获取最终的配置
   *
   * @param {CustomedWebpackConfigs} defaultConfig 内置默认配置
   * @return {*}  {Promise<CustomedWebpackConfigs>}
   * @memberof WebpackConfigHookManager
   */
  public async run(defaultConfig: CustomedWebpackConfigs): Promise<CustomedWebpackConfigs> {
    let webpackConfig = defaultConfig;
    try {
      const { beforeAll, afterAll, ...otherHooks } = this.hooks;
      // 全局前置钩子
      if (beforeAll) {
        webpackConfig = await beforeAll.promise(webpackConfig);
      }

      // 其他简单钩子
      for (const hookName of Object.keys(otherHooks || {})) {
        const value = await otherHooks[hookName].promise(webpackConfig[hookName]);
        const iSValueUneffective = value === undefined || value === null;
        if (iSValueUneffective) {
          delete webpackConfig[hookName];
        } else {
          webpackConfig[hookName] = value;
        }
      }

      // 全局后置钩子
      if (afterAll) {
        webpackConfig = await afterAll.promise(webpackConfig);
      }
    } catch (err) {
      logger.error(`[${INNER_PLUGIN_NAME}] 运行 hooks 异常：`, err);
    }
    return webpackConfig;
  }
}

export { WebpackConfigHookManager };
