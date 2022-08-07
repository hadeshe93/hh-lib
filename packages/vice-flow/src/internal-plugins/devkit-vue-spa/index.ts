import { VueTsSpaInitiator } from './initiator';
import { WorkflowManager } from './workflow-manager';
import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    // 注册模板
    ctx.initiatorManager.register({
      templateName: 'webpack5-starter-vue3-ts',
      fn: () => {
        return new VueTsSpaInitiator();
      },
    });

    // 注册命令
    ctx.commander.register({
      command: 'vs:dev',
      description: 'Develope project of vue spa',
      optionMap: {
        cwd: {
          description: 'Specify current working directory',
          valueName: 'path',
        },
      },
      fn: (options) => {
        const devManager = new WorkflowManager();
        devManager.run({
          actType: 'dev',
          ...options,
        });
      },
    });

    // 注册命令
    ctx.commander.register({
      command: 'vs:build',
      description: 'Build project of vue spa',
      optionMap: {
        cwd: {
          description: 'Specify current working directory',
          valueName: 'path',
        },
      },
      fn: (options) => {
        const devManager = new WorkflowManager();
        devManager.run({
          actType: 'build',
          ...options,
        });
      },
    });
  },
});
