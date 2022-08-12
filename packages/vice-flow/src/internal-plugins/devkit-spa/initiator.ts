import path from 'path';
import fsExtra from 'fs-extra';
import { downloadGitRepo } from '@hadeshe93/lib-node';

import { Interactor } from '../../core/interactor';

interface SpaInitiatorOptions {
  frameworkType: 'vue' | 'react';
}

export class SpaInitiator extends Interactor {
  options: SpaInitiatorOptions;
  conifg = {
    vue: {
      repoUrl: 'github:hadeshe93/webpack5-starter',
      repoTemplatePath: 'packages/webpack5-starter-vue3-ts',
    },
    react: {
      repoUrl: 'github:hadeshe93/webpack5-starter',
      repoTemplatePath: 'packages/webpack5-starter-react-ts',
    },
  };

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
    const templateConfig = this.conifg[this.options.frameworkType];
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
