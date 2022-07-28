import type { OptionsForRunWebpackConfigHookManager } from '@hadeshe93/webpack-config';

export interface DevOptions {
  // 页面名称
  pageName: string;
  optionsForRun: OptionsForRunWebpackConfigHookManager;
}

export interface DevReuslt {
  options: DevOptions;
  isSuccess: boolean;
  message: string;
}

export interface BuildOptions {
  // 页面名称
  pageName: string;
  optionsForRun: OptionsForRunWebpackConfigHookManager | OptionsForRunWebpackConfigHookManager[];
}

export interface BuildReuslt {
  options: BuildOptions;
  isSuccess: boolean;
  message: string;
}
