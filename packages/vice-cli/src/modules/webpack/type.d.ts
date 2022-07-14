import { CustomedWebpackConfigs } from '@hadeshe93/webpack-config';

export interface DevOptions {
  // 页面名称
  pageName: string;
  // webpack 配置
  webpackConfigs: CustomedWebpackConfigs;
}

export interface DevReuslt {
  options: DevOptions;
  isSuccess: boolean;
  message: string;
}

export interface BuildOptions {
  // 页面名称
  pageName: string;
  // webpack 配置
  webpackConfigs: CustomedWebpackConfigs | CustomedWebpackConfigs[];
}

export interface BuildReuslt {
  options: BuildOptions;
  isSuccess: boolean;
  message: string;
}
