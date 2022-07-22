import type { CustomedWebpackConfigHooksPlugin } from '@hadeshe93/webpack-config';

export interface ViceConfigs {
  // =========== 页面配置 START ===========
  page?: {
    // 页面标题，用于 <title>，运行时可以用 document.title 获取
    title?: string;
    // 页面描述
    description?: string;
    // 是否注入 flexible 响应式设计稿机制
    useFlexible?: boolean;
    // 是否注入 eruda 机制
    useEruda?: boolean;
  };

  // =========== 构建配置 START ===========
  build?: {
    // dll 包构建入口映射，falsy 值表示不开启 dll 包
    dllEntryMap?: Record<string, string[]> | false | undefined | null | 0;
  };

  // =========== 插件配置 START ===========
  plugins?: {
    // webpack 配置的 hook 插件
    webpackConfigHooks: CustomedWebpackConfigHooksPlugin | CustomedWebpackConfigHooksPlugin[];
  };
}
