import { CustomedPlugin } from '@hadeshe93/lib-node';
import type { CreateOptions, CreateReuslt } from './type';

export function getCustomedCreatePlugin(): CustomedPlugin {
  return {
    pluginName: 'customedCreatePlugin',
    hooks: {
      async create(createOptions: CreateOptions): Promise<CreateReuslt> {
        // 执行创建流程
        const result = await createOptions.createFunc(createOptions);
        return {
          options: Object.freeze({ ...createOptions }),
          ...result,
        };
      },
    },
  };
}
