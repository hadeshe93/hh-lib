import type { AsyncHook } from 'tapable';

export type CustomedPlugin = {
  pluginName: string;
  // hooks: Record<string, (...args: any[]) => any>;
  hooks: Partial<{
    [name: string]: (...args: any[]) => any;
  }>;
};

/**
 * AsyncHook 抽象管理类
 *
 * @export
 * @abstract
 * @class AsyncHooksManager
 */
export abstract class AsyncHooksManager {
  public abstract hooks: Record<string, AsyncHook<any, any>>;
  public abstract customedPlugins: CustomedPlugin[];

  /**
   * 运行所有钩子
   *
   * @abstract
   * @param {...any[]} args
   * @returns Promise 实例
   * @memberof AsyncHooksManager
   */
  public abstract run(...args: any[]): Promise<any>;

  /**
   * 加载插件文件，可被子类重载
   *
   * @protected
   * @param {string} pluginFilePath
   * @returns CustomedPlugin 配置
   * @memberof AsyncHooksManager
   */
  protected async loadPluginFile(pluginFilePath: string): Promise<CustomedPlugin> {
    return require(pluginFilePath) as CustomedPlugin;
  }

  /**
   * 加载用户自定义的插件
   *
   * @param {string} pluginFilePath
   * @param {(pluginFilePath: string) => Promise<CustomedPlugin>} [loadPluginConfigs]
   * @returns CustomedPlugin 配置数组
   * @memberof AsyncHooksManager
   */
  public async loadPlugin(
    pluginFilePath: string,
    loadPluginConfigs?: (pluginFilePath: string) => Promise<CustomedPlugin>,
  ): Promise<CustomedPlugin[]> {
    if (!loadPluginConfigs) {
      loadPluginConfigs = this.loadPluginFile.bind(this);
    }
    const customedPlugin = await loadPluginConfigs(pluginFilePath);
    this.customedPlugins.push(customedPlugin);
    const { pluginName = '', hooks } = customedPlugin;
    const customedHooks = hooks || {};
    Object.keys(customedHooks).forEach((hookName) => {
      const hook = this.hooks[hookName];
      if (hook) {
        hook.tapPromise(pluginName, async function (...args) {
          // 封装用户自定义钩子函数，以兼容 sync 或 async 的方法
          return await customedHooks[hookName].apply(this, args);
        });
      }
    });
    return this.customedPlugins;
  }
}
