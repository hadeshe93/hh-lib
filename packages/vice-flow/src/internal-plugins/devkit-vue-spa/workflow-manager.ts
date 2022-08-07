import { VueConfig } from '@hadeshe93/webpack-config';

import { doDev, doBuild } from '../../utils/webpack';
import { Interactor } from '../../core/interactor';

type OptionsForRunningWorkflowManager = {
  actType: 'dev' | 'build';
  cwd?: string;
};

interface WorkflowManagerCtx {
  vueConfig: VueConfig;
  projectRootPath: string;
  pageName: string;
  actType: '' | 'dev' | 'build';
}

export class WorkflowManager extends Interactor {
  ctx: WorkflowManagerCtx = {
    vueConfig: new VueConfig(),
    projectRootPath: '',
    pageName: '',
    actType: '',
  };

  async initialize(options?: OptionsForRunningWorkflowManager): Promise<void> {
    console.log('===> options:', options);
    const processCwd = process.cwd();
    const projectRootPath = options?.cwd || processCwd;
    if (projectRootPath !== processCwd) {
      process.chdir(projectRootPath);
    }
    this.ctx.projectRootPath = projectRootPath;
    this.ctx.actType = options.actType;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const answerMap: { pageName: string } = await enquirer.prompt([
      {
        type: 'input',
        name: 'pageName',
        message: 'Please input the page name to develope:',
      },
    ]);
    this.ctx.pageName = answerMap.pageName;
  }

  async act(): Promise<void> {
    const { actType } = this.ctx;
    if (actType === 'dev') {
      await this.doDev();
      return;
    }
    if (actType === 'build') {
      await this.doBuild();
      return;
    }
  }

  async doDev() {
    const webpackConfig = await this.ctx.vueConfig.getDevConfig({
      projectRootPath: this.ctx.projectRootPath,
      pageName: this.ctx.pageName,
    });
    return await doDev([webpackConfig]);
  }

  async doBuild() {
    const webpackConfig = await this.ctx.vueConfig.getProdConfig({
      projectRootPath: this.ctx.projectRootPath,
      pageName: this.ctx.pageName,
    });
    return await doBuild([webpackConfig]);
  }
}
