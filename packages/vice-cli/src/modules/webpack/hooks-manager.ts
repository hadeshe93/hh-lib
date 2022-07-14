import { AsyncParallelBailHook, AsyncSeriesWaterfallHook } from 'tapable';
import { AsyncHooksManager, CustomedPlugin } from '@hadeshe93/lib-node';

import type { DevOptions, DevReuslt, BuildOptions, BuildReuslt } from './type.d';

class WebpackPageHookManager extends AsyncHooksManager {
  constructor() {
    super();
  }

  public hooks = {
    beforeDev: new AsyncSeriesWaterfallHook<DevOptions>(['devOptions']),
    dev: new AsyncParallelBailHook<DevOptions, Promise<DevReuslt>>(['devOptions']),
    beforeBuild: new AsyncSeriesWaterfallHook<BuildOptions>(['buildOptions']),
    build: new AsyncParallelBailHook<BuildOptions, Promise<BuildReuslt>>(['buildOptions']),
  };
  public customedPlugins: CustomedPlugin[] = [];

  /**
   * 执行 dev 流程
   *
   * @param {DevOptions} devOptions
   * @returns any
   * @memberof WebpackPageHookManager
   */
  public async runDev(devOptions: DevOptions): Promise<any> {
    devOptions = await this.hooks.beforeDev.promise(devOptions);
    return await this.hooks.dev.promise(devOptions);
  }

  /**
   * 执行 build 流程
   *
   * @param {BuildOptions} buildOptions
   * @returns any
   * @memberof WebpackPageHookManager
   */
  public async runBuild(buildOptions: BuildOptions): Promise<any> {
    buildOptions = await this.hooks.beforeBuild.promise(buildOptions);
    return await this.hooks.build.promise(buildOptions);
  }

  /**
   * 执行流程
   *
   * @param {('dev' | 'build')} cmd
   * @param {(DevOptions | BuildOptions)} options
   * @returns any
   * @memberof WebpackPageHookManager
   */
  public run(cmd: 'dev' | 'build', options: DevOptions | BuildOptions): Promise<any> {
    if (cmd === 'dev') return this.runDev(options as DevOptions);
    if (cmd === 'build') return this.runBuild(options as BuildOptions);
    throw new Error('cmd is not allowed');
  }
}

export { WebpackPageHookManager };
