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

    // 注册开发调试命令
    ctx.commander.register({
      command: 'spa:dev',
      description: 'Develope page of spa project',
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

    // 注册构建命令
    ctx.commander.register({
      command: 'spa:build',
      description: 'Build page of spa project',
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

    // 注册部署命令
    ctx.commander.register({
      command: 'spa:deploy',
      description: 'Deploy page of spa project',
      argumentList: [
        [
          'pageName',
          {
            description: 'The target page name',
            required: false,
          },
        ],
      ],
      optionMap: {
        cwd: {
          description: 'Specify current working directory',
          valueName: 'path',
        },
        accessKeyId: {
          description: 'Specify the temporary accessKeyId for aliyun cos',
          valueName: 'id',
        },
        accessKeySecret: {
          description: 'Specify the temporary accessKeySecret for aliyun cos',
          valueName: 'secret',
        },
      },
      fn: (options) => {
        const devManager = new WorkflowManager();
        devManager.run({
          actType: 'deploy',
          ...options,
        });
      },
    });
  },
});
