import { WebpackOptionsNormalized, Configuration, Entry, ModuleOptions, Cache, Stats } from 'webpack';

// webpack 运行场景
export type CustomedWebpackScene = 'dev' | 'build' | 'buildDll';

export type WebpackManagerHookStartInfo = {
  scene: CustomedWebpackScene;
};

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
export interface DevServer extends Required<WebpackOptionsNormalized['devServer']> {
  [key: string]: any;
}
export type Plugins = Required<Configuration['plugins']>;
export type Plugin = Plugins extends Array<infer U> ? U : any;
export type PluginClass = {
  new (...args: any[]): Plugin;
  prototype: Plugin;
};
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

export type DllEntryMap = Record<string, string[]> | false | undefined | null | 0;
export type ProxyCreatingPlugin = (pluginClass: PluginClass, args: any[]) => Promise<Plugin>;

export type GetWebpackConfigs = (options: OptionsForGetWebpackConfigs) => Promise<CustomedWebpackConfigs>;
export interface OptionsForGetWebpackConfigs {
  projectRootPath: string;
  pageName: string;
  mode?: CustomedWebpackConfigs['mode'];
  dllEntryMap?: DllEntryMap;
  proxyCreatingPlugin?: ProxyCreatingPlugin;
}
export type BeforeNewPluginOptions = {
  pluginClass: PluginClass;
  args: any[];
};
export interface WebpackConfigHooks {
  start: (options: WebpackManagerHookStartInfo) => Promise<void>;
  beforeNewPlugin: (options: BeforeNewPluginOptions) => Promise<BeforeNewPluginOptions>;
  beforeMerge: (config: CustomedWebpackConfigs) => Promise<CustomedWebpackConfigs>;
  afterMerge: (config: CustomedWebpackConfigs) => Promise<CustomedWebpackConfigs>;
  context: (config: string) => Promise<string>;
  mode: (config: string) => Promise<string>;
  entry: (config: Entry) => Promise<Entry>;
  output: (config: Outputs) => Promise<Outputs>;
  module: (config: ModuleOptions) => Promise<ModuleOptions>;
  resolve: (config: Resolve) => Promise<Resolve>;
  optimization: (config: Optimization) => Promise<Optimization>;
  plugins: (config: Plugins) => Promise<Plugins>;
  devServer: (config: DevServer) => Promise<DevServer>;
  cache: (config: Cache) => Promise<Cache>;
  devtool: (config: DevTool) => Promise<DevTool>;
  target: (config: Target) => Promise<Target>;
  watch: (config: Watch) => Promise<Watch>;
  watchOptions: (config: WatchOptions) => Promise<WatchOptions>;
  externals: (config: Externals) => Promise<Externals>;
  performance: (config: Performance) => Promise<Performance>;
  node: (config: Node) => Promise<Node>;
  stats: (config: Stats) => Promise<Stats>;
}

export interface CustomedWebpackConfigHooksPlugin {
  pluginName: string;
  hooks: Partial<WebpackConfigHooks>;
}
