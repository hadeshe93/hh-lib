import path from 'path';
import fsExtra from 'fs-extra';
import { downloadGitRepo } from '@hadeshe93/lib-node';

import { Interactor } from '../../core/interactor';

export class VueTsSpaInitiator extends Interactor {
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
    const destTplRepoPath = path.resolve(this.ctx.dest, `.temp_${new Date().getTime()}`);
    const destTplRealPath = path.resolve(destTplRepoPath, 'packages/webpack5-starter-vue3-ts');
    this.ctx.destTplRepoPath = destTplRepoPath;
    this.ctx.destTplRealPath = destTplRealPath;

    await this.logger.ing('Downloading template ...', () =>
      downloadGitRepo('github:hadeshe93/webpack5-starter', destTplRepoPath),
    );
    await fsExtra.copy(this.ctx.destTplRealPath, this.ctx.dest);
  }
  async end() {
    await fsExtra.remove(this.ctx.destTplRepoPath);
  }
}
