import { SpaInitiator } from './initiator';
import { WorkflowManager } from './workflow-manager';
import { spaFrameworkConfigMap } from './lib/configs';
import { SpaFrameworkType } from './types/config';
import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    // 注册项目模板
    Object.entries(spaFrameworkConfigMap).forEach(([frameworkType, info]) => {
      ctx.initiatorManager.register({
        templateName: info.templateName,
        fn: () => {
          return new SpaInitiator({ frameworkType: frameworkType as SpaFrameworkType });
        },
      });
    });

    const COMMON_OPTION_MAP = {
      cwd: {
        description: 'Specify current working directory',
        valueName: 'path',
      },
    };

    // 注册开发调试命令
    ctx.commander.register({
      command: 'spa:dev',
      description: 'Develope page of spa project',
      optionMap: {
        ...COMMON_OPTION_MAP,
      },
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
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
        ...COMMON_OPTION_MAP,
      },
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
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
        ...COMMON_OPTION_MAP,
        reset: {
          description: 'Reset configs of aliyun oss',
        },
        accessKeyId: {
          description: 'Specify the temporary accessKeyId for aliyun oss',
          valueName: 'id',
        },
        accessKeySecret: {
          description: 'Specify the temporary accessKeySecret for aliyun oss',
          valueName: 'secret',
        },
        bucket: {
          description: 'Specify the bucket for aliyun oss',
          valueName: 'bucket',
        },
        region: {
          description: 'Specify the region for aliyun oss',
          valueName: 'region',
        },
      },
      fn: (options) => {
        const wfManager = new WorkflowManager();
        wfManager.run({
          actType: 'deploy',
          ...options,
        });
      },
    });
  },
});
