import glob from 'glob';
import path from 'path';
import { ProjectActor } from './lib/project-actor';
import { Interactor } from '../../core/interactor';
import { getInternalPluginName } from '../../utils/plugin';

type OptionsForRunningWorkflowManager = {
  pageName?: string;
  actType?: 'dev' | 'build' | 'deploy';
  cwd?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
};

interface WorkflowManagerCtx {
  projectRootPath: string;
  projectPagesPath: string;
  options: OptionsForRunningWorkflowManager;
}

export class WorkflowManager extends Interactor {
  ctx: WorkflowManagerCtx = {
    projectRootPath: '',
    projectPagesPath: '',
    options: {},
  };

  async initialize(options: OptionsForRunningWorkflowManager): Promise<void> {
    const processCwd = process.cwd();
    const projectRootPath = options?.cwd || processCwd;
    if (projectRootPath !== processCwd) {
      process.chdir(projectRootPath);
    }
    this.ctx.projectRootPath = projectRootPath;
    this.ctx.projectPagesPath = path.resolve(projectRootPath, 'src', 'pages');
    this.ctx.options = options;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const { options } = this.ctx;
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

    if (options.actType === 'deploy') {
      await this.ensureDeploymentAccess(options, enquirer);
    }
  }

  async act(): Promise<void> {
    const { projectRootPath, options } = this.ctx;
    const { actType, pageName } = options;
    const optionsForProjectActor = {
      projectRootPath,
      pageName,
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
      console.log('deploy options:', options);
      return;
    }
  }

  private async ensureDeploymentAccess(options: OptionsForRunningWorkflowManager, enquirer: typeof import('enquirer')) {
    const { plugins } = this.configuration.data;
    const thisPluginName = getInternalPluginName(__dirname);
    const internalDeployPluginIdx = plugins.findIndex((plugin) => plugin.name === thisPluginName);
    const internalDeployPlugin = plugins[internalDeployPluginIdx];
    const hasAccessInConfig = internalDeployPlugin.config?.accessKeyId && internalDeployPlugin.config?.accessKeySecret;
    const hasAccessInOptions = options.accessKeyId && options.accessKeySecret;
    let accessKeyId = '';
    let accessKeySecret = '';

    if (hasAccessInOptions) {
      ({ accessKeyId, accessKeySecret } = options);
    } else if (hasAccessInConfig) {
      ({ accessKeyId, accessKeySecret } = internalDeployPlugin.config);
    } else {
      const answers = (await enquirer.prompt([
        {
          type: 'input',
          name: 'accessKeyId',
          message: 'Please config accessKeyId of aliyun cos:',
        },
        {
          type: 'input',
          name: 'accessKeySecret',
          message: 'Please config accessKeySecret of aliyun cos:',
        },
      ])) as { accessKeyId: string; accessKeySecret: string };
      ({ accessKeyId, accessKeySecret } = answers);
      const { config } = internalDeployPlugin;
      this.configuration.data.plugins[internalDeployPluginIdx].config = {
        ...(config || {}),
        accessKeyId,
        accessKeySecret,
      };
      this.configuration.save();
    }
    options.accessKeyId = accessKeyId;
    options.accessKeySecret = accessKeySecret;
  }
}
