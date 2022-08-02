import type { ProxyCreatingPlugin } from '../typings/configs';

/**
 * 默认的 webpack plugin 钩子函数
 *
 * @export
 * @param {*} pluginClass
 * @param {*} [args=[]]
 * @returns 创建 webpack plugin 实例的代理方法
 */
export function defaultWebpackPluginHook(pluginClass, args = []): ProxyCreatingPlugin {
  return Reflect.construct(pluginClass, args || []);
}
