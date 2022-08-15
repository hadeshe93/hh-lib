import path from 'path';
import fsExtra from 'fs-extra';
import { downloadGitRepo } from '@hadeshe93/lib-node';

import { Interactor } from '../../core/interactor';
import { spaFrameworkConfigMap } from './lib/configs';

interface SpaInitiatorOptions {
  frameworkType: 'vue' | 'react' | 'react-cms';
}

export class SpaInitiator extends Interactor {
  options: SpaInitiatorOptions;

  constructor(options: SpaInitiatorOptions) {
    super();
    this.options = options;
  }

  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const answerMap: { appName: string } = await enquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Please input your app name:',
      },
    ]);
    this.ctx.appName = answerMap.appName;
    this.ctx.dest = path.resolve(process.cwd(), answerMap.appName);
  }

  async act(): Promise<void> {
    const templateConfig = spaFrameworkConfigMap[this.options.frameworkType];
    const destTplRepoPath = path.resolve(this.ctx.dest, `.temp_${new Date().getTime()}`);
    const destTplRealPath = path.resolve(destTplRepoPath, templateConfig.repoTemplatePath);
    this.ctx.destTplRepoPath = destTplRepoPath;
    this.ctx.destTplRealPath = destTplRealPath;

    await this.logger.ing('Downloading template ...', () => downloadGitRepo(templateConfig.repoUrl, destTplRepoPath));
    await fsExtra.copy(this.ctx.destTplRealPath, this.ctx.dest);
  }
  async end() {
    await fsExtra.remove(this.ctx.destTplRepoPath);
  }
}
