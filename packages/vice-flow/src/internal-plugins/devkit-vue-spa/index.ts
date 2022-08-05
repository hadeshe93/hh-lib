import path from 'path';
import fsExtra from 'fs-extra';
import { downloadGitRepo } from '@hadeshe93/lib-node';

import { definePluigin } from '../../core';
import { Initiator } from '../../core/initiator';
class VueTsSpaInitiator extends Initiator {
  async prompt(enquirer: typeof import('enquirer')): Promise<void> {
    const answerMap: { appName: string } = await enquirer.prompt([
      {
        type: 'input',
        name: 'appName',
        message: 'Please input your app name:',
      },
    ]);
    this.ctx.appName = answerMap.appName;
    this.ctx.dest = path.resolve(this.ctx.dest, answerMap.appName);
  }
  async generate(): Promise<void> {
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

export default definePluigin({
  apply(ctx) {
    ctx.initiatorManager.register({
      templateName: 'webpack5-starter-vue3-ts',
      fn: () => {
        return new VueTsSpaInitiator();
      },
    });
  },
});
