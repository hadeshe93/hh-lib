import type { CustomedWebpackConfigHooksPlugin } from '@hadeshe93/webpack-config';

export interface WebpackProjectConfigs {
  // =========== 页面配置 START ===========
  page: {
    // 页面标题，用于 <title>，运行时可以用 document.title 获取
    title: string;
    // 页面描述
    description: string;
    // 是否注入 flexible 响应式设计稿机制
    useFlexible?: boolean;
    // 是否注入调试器机制
    // - 默认使用 mdebug，可以在地址栏 debuggerType 指定其他类型（eruda 或 vConsole）
    useDebugger?: boolean;
    // pxtorem 选项，配合 useFlexible 一起使用
    pxtoremOptions?: {
      rootValue?: number;
      unitPrecision?: number;
      propList?: string[];
      selectorBlackList?: string[];
      replace?: boolean;
      mediaQuery?: boolean;
      minPixelValue?: number;
      exclude?: RegExp;
    };
  };

  // =========== 构建配置 START ===========
  build: {
    frameworkType: 'vue' | 'react';
    // dll 包构建入口映射，falsy 值表示不开启 dll 包
    dllEntryMap?: Record<string, string[]> | false | undefined | null | 0;
  };

  // =========== 插件配置 START ===========
  plugins?: {
    // webpack 配置的 hook 插件，权重最大
    webpackConfigHooks?: CustomedWebpackConfigHooksPlugin | CustomedWebpackConfigHooksPlugin[];
  };
}
