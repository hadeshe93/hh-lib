import { WebpackOptionsNormalized, Configuration, Entry } from 'webpack';

// 暂时用以规避单独使用 Configuration['output'] 产生类型报错的问题
export interface Outputs extends Required<Configuration['output']> {
  [key: string]: any;
}
export interface Resolve extends Required<Configuration['resolve']> {
  [key: string]: any;
}
export interface Optimization extends Required<Configuration['optimization']> {
  [key: string]: any;
}
export interface Plugins extends Required<Configuration['plugins']> {
  [key: string]: any;
}
export interface DevServer extends Required<WebpackOptionsNormalized['devServer']> {
  [key: string]: any;
}
export type DevTool = Required<WebpackOptionsNormalized['devtool']>;
export type Target = Required<WebpackOptionsNormalized['target']>;
export type Watch = Required<WebpackOptionsNormalized['watch']>;
export interface WatchOptions extends Required<WebpackOptionsNormalized['watchOptions']> {
  [key: string]: any;
}
export type Externals = WebpackOptionsNormalized['externals'] | any;
export type Performance = WebpackOptionsNormalized['performance'] | any;
export type Node = Configuration['node'] | any;

export interface CustomedWebpackConfigs extends Configuration {
  devServer?: DevServer;
}

export interface GetConfigOptions {
  mode: CustomedWebpackConfigs['mode'];
  projectRootPath: string;
}

export interface CustomedHooks {
  pluginName: string;
  hooks: {
    beforeAll?: (CustomedWebpackConfigs) => Promise<CustomedWebpackConfigs>;
    afterAll?: (CustomedWebpackConfigs) => Promise<CustomedWebpackConfigs>;
    context?: (string) => Promise<string>;
    mode?: (string) => Promise<string>;
    entry?: (Entry) => Promise<Entry>;
  };
}
