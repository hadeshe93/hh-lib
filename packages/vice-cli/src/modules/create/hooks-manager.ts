import { AsyncParallelBailHook } from 'tapable';
import { AsyncHooksManager, CustomedPlugin } from '@hadeshe93/lib-node';

import type { CreateReuslt, CreateOptions } from './type.d';

class CreateHookManager extends AsyncHooksManager {
  constructor() {
    super();
  }

  public hooks = {
    create: new AsyncParallelBailHook<CreateOptions, Promise<CreateReuslt>>(['createOptions']),
  };
  public customedPlugins: CustomedPlugin[] = [];

  public async run(createOptions: CreateOptions): Promise<any> {
    const createResult = await this.hooks.create.promise(createOptions);
    // 创建流程
    return createResult;
  }
}

export { CreateHookManager };
