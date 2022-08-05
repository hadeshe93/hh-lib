import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { VueConfig } from '@hadeshe93/webpack-config';

import { Interactor } from '../../core/interactor';

type OptionsForRunningDevManager = {
  cwd?: string;
};

export class DevManager extends Interactor {
  ctx = {
    vueConfig: new VueConfig(),
    projectRootPath: '',
    pageName: '',
  };

  async initialize(options?: OptionsForRunningDevManager): Promise<void> {
    const processCwd = process.cwd();
    const projectRootPath = options?.cwd || processCwd;
    this.ctx.projectRootPath = projectRootPath;
    if (projectRootPath !== processCwd) {
      process.chdir(this.ctx.projectRootPath);
    }
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
    const webpackConfig = await this.ctx.vueConfig.getDevConfig({
      projectRootPath: this.ctx.projectRootPath,
      pageName: this.ctx.pageName,
    });
    const compiler = webpack(webpackConfig);
    const devServerOptions = { ...webpackConfig.devServer, open: false };
    const server = new WebpackDevServer(devServerOptions, compiler);
    server.start();
  }
}
