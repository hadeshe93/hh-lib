import { SpaInitiator } from './initiator';
import { WorkflowManager } from './workflow-manager';
import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    // 注册 vue 项目模板
    ctx.initiatorManager.register({
      templateName: 'webpack5-starter-vue3-ts',
      fn: () => {
        return new SpaInitiator({ frameworkType: 'vue' });
      },
    });
    // 注册 react 项目模板
    ctx.initiatorManager.register({
      templateName: 'webpack5-starter-react-ts',
      fn: () => {
        return new SpaInitiator({ frameworkType: 'react' });
      },
    });

    // 注册命令
    ctx.commander.register({
      command: 'spa:dev',
      description: 'Develope project of spa project',
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
      command: 'spa:build',
      description: 'Build project of spa project',
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
