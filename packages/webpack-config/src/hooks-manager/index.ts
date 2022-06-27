import type { Entry, Module, Cache, Stats } from 'webpack';
import { AsyncSeriesWaterfallHook } from 'tapable';
import type {
  CustomedWebpackConfigs,
  CustomedHooks,
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

class WebpackConfigHookManager {
  public hooks = {
    // 全局前置钩子
    beforeAll: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs, CustomedWebpackConfigs>([HOOK_PARAM]),
    // 全局后置钩子
    afterAll: new AsyncSeriesWaterfallHook<CustomedWebpackConfigs, CustomedWebpackConfigs>([HOOK_PARAM]),

    context: new AsyncSeriesWaterfallHook<string, string>([HOOK_PARAM]),
    mode: new AsyncSeriesWaterfallHook<string, string>([HOOK_PARAM]),
    entry: new AsyncSeriesWaterfallHook<Entry, Entry>([HOOK_PARAM]),
    output: new AsyncSeriesWaterfallHook<Outputs, Outputs>([HOOK_PARAM]),
    module: new AsyncSeriesWaterfallHook<Module, Module>([HOOK_PARAM]),
    resolve: new AsyncSeriesWaterfallHook<Resolve, Resolve>([HOOK_PARAM]),
    optimization: new AsyncSeriesWaterfallHook<Optimization, Optimization>([HOOK_PARAM]),
    plugins: new AsyncSeriesWaterfallHook<Plugins, Plugins>([HOOK_PARAM]),
    devServer: new AsyncSeriesWaterfallHook<DevServer, DevServer>([HOOK_PARAM]),
    cache: new AsyncSeriesWaterfallHook<Cache, Cache>([HOOK_PARAM]),
    devtool: new AsyncSeriesWaterfallHook<DevTool, DevTool>([HOOK_PARAM]),
    target: new AsyncSeriesWaterfallHook<Target, Target>([HOOK_PARAM]),
    watch: new AsyncSeriesWaterfallHook<Watch, Watch>([HOOK_PARAM]),
    watchOptions: new AsyncSeriesWaterfallHook<WatchOptions, WatchOptions>([HOOK_PARAM]),
    externals: new AsyncSeriesWaterfallHook<Externals, Externals>([HOOK_PARAM]),
    performance: new AsyncSeriesWaterfallHook<Performance, Performance>([HOOK_PARAM]),
    node: new AsyncSeriesWaterfallHook<Node, Node>([HOOK_PARAM]),
    stats: new AsyncSeriesWaterfallHook<Stats, Stats>([HOOK_PARAM]),
  };
  public customedHooks = {
    pluginName: '',
  };

  /**
   * 加载用户自定义的 hooks 配置文件
   *
   * @param {*} hooksFilePath
   * @return {*}  {Promise<CustomedHooks>}
   * @memberof WebpackConfigHookManager
   */
  public async loadHooksFile(hooksFilePath): Promise<CustomedHooks> {
    this.customedHooks = require(hooksFilePath) as CustomedHooks;
    const { pluginName = '', ...customedHooks } = this.customedHooks;
    Object.keys(customedHooks).forEach((hookName) => {
      const hook = this.hooks[hookName];
      if (hook) {
        hook.tapPromise(pluginName, async function (...args) {
          // 封装用户自定义钩子函数，以兼容 sync 或 async 的方法
          return await customedHooks[hookName].apply(this, args);
        });
      }
    });
    return this.customedHooks;
  }

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
