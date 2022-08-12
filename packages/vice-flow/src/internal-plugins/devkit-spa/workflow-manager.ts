import { ProjectActor } from './lib/project-actor';
import { Interactor } from '../../core/interactor';

type OptionsForRunningWorkflowManager = {
  actType: 'dev' | 'build';
  cwd?: string;
};

interface WorkflowManagerCtx {
  projectRootPath: string;
  pageName: string;
  actType: '' | 'dev' | 'build';
}

export class WorkflowManager extends Interactor {
  ctx: WorkflowManagerCtx = {
    projectRootPath: '',
    pageName: '',
    actType: '',
  };

  async initialize(options?: OptionsForRunningWorkflowManager): Promise<void> {
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
      await new ProjectActor(this.ctx).doDev();
      return;
    }
    if (actType === 'build') {
      await new ProjectActor(this.ctx).doBuild();
      return;
    }
  }
}
