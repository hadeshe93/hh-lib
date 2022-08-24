import glob from 'glob';
import path from 'path';
import { PAGES_RELATIVE_PATH } from '@hadeshe93/webpack-config';

import { ProjectActor } from './lib/project-actor';
import { Interactor } from '../../core/interactor';
import { getInternalPluginName } from '../../utils/plugin';

type BaseOptionsForRunningWorkflow = {
  pageName?: string;
  actType?: 'dev' | 'build' | 'deploy';
  cwd?: string;
};

type OptionsForRunningWorkflow = BaseOptionsForRunningWorkflow & {
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;
  region?: string;
};

interface WorkflowManagerCtx {
  projectRootPath: string;
  projectPagesPath: string;
  options: OptionsForRunningWorkflow;
}

interface DeployAccessAnswer {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
}

export class WorkflowManager extends Interactor {
  ctx: WorkflowManagerCtx = {
    projectRootPath: '',
    projectPagesPath: '',
    options: {},
  };

  async initialize(options: OptionsForRunningWorkflow): Promise<void> {
    const processCwd = process.cwd();
    const projectRootPath = options?.cwd || processCwd;
    if (projectRootPath !== processCwd) {
      process.chdir(projectRootPath);
    }
    this.ctx.projectRootPath = projectRootPath;
    this.ctx.projectPagesPath = path.resolve(projectRootPath, PAGES_RELATIVE_PATH);
    this.ctx.options = options;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const { options } = this.ctx;

    if (options.actType === 'deploy') {
      await this.ensureDeploymentAccess(options, enquirer);
    }

    if (!options.pageName) {
      const pagesList = glob
        .sync(path.join(this.ctx.projectPagesPath, '/*'))
        .map((pagePath) => path.basename(pagePath));
      const question = {
        name: 'pageName',
        message: 'Please target the page name:',
        limit: 10,
        initial: 0,
        choices: pagesList,
      };
      const prompt = new enquirer['AutoComplete'](question);
      this.ctx.options.pageName = await prompt.run();
    }
  }

  async act(): Promise<void> {
    const { projectRootPath, options } = this.ctx;
    const { actType, pageName } = options;
    const optionsForProjectActor = {
      projectRootPath,
      pageName,
      logger: this.logger,
    };
    if (actType === 'dev') {
      await new ProjectActor(optionsForProjectActor).doDev();
      return;
    }
    if (actType === 'build') {
      await new ProjectActor(optionsForProjectActor).doBuild();
      return;
    }
    if (actType === 'deploy') {
      // console.log('deploy options:', options);
      await new ProjectActor(optionsForProjectActor).deploy({
        accessKeyId: options.accessKeyId,
        accessKeySecret: options.accessKeySecret,
        bucket: options.bucket,
        region: options.region,
      });
      return;
    }
  }

  private async ensureDeploymentAccess(options: OptionsForRunningWorkflow, enquirer: typeof import('enquirer')) {
    const needResetAccess = options['reset'] || false;
    const { plugins } = this.configuration.data;
    const thisPluginName = getInternalPluginName(__dirname);
    const internalDeployPluginIdx = plugins.findIndex((plugin) => plugin.name === thisPluginName);
    const { config: internalDeployPluginConfig = {} } = plugins[internalDeployPluginIdx];
    const hasAccessInConfig = internalDeployPluginConfig?.accessKeyId && internalDeployPluginConfig?.accessKeySecret;
    const hasAccessInOptions = options.accessKeyId && options.accessKeySecret;
    let accessKeyId = '';
    let accessKeySecret = '';
    let bucket = '';
    let region = '';

    if (hasAccessInOptions && !needResetAccess) {
      ({ accessKeyId, accessKeySecret, bucket, region } = options);
    } else if (hasAccessInConfig && !needResetAccess) {
      ({ accessKeyId, accessKeySecret, bucket, region } = internalDeployPluginConfig);
    } else {
      const message = needResetAccess
        ? 'Reseting aliyun oss configs for deploying. Please follow the instructions show below:'
        : 'You have not config aliyun oss for deploying. Please follow the instructions show below:';
      this.logger.warn(message);
      const answers = (await enquirer.prompt([
        {
          type: 'input',
          name: 'accessKeyId',
          message: 'Please config access-key-id of aliyun oss:',
        },
        {
          type: 'input',
          name: 'accessKeySecret',
          message: 'Please config access-key-secret of aliyun oss:',
        },
        {
          type: 'input',
          name: 'bucket',
          message: 'Please config bucket of aliyun oss:',
        },
        {
          type: 'input',
          name: 'region',
          message: 'Please config region of aliyun oss:',
        },
      ])) as DeployAccessAnswer;
      ({ accessKeyId, accessKeySecret, bucket, region } = answers);
      this.configuration.data.plugins[internalDeployPluginIdx].config = {
        ...(internalDeployPluginConfig || {}),
        accessKeyId,
        accessKeySecret,
        bucket,
        region,
      };
      this.configuration.save();
    }
    options.accessKeyId = accessKeyId;
    options.accessKeySecret = accessKeySecret;
    options.bucket = bucket;
    options.region = region;
  }
}
