import { createPromptModule } from 'inquirer';
import { getDevConfig, getProdConfig, getProdDllConfig } from '@hadeshe93/webpack-config';
import { WebpackPageHookManager } from './hooks-manager';
import { getCustomedPlugin } from './plugins';
import logger from '../../libs/logger';
import { getPromptQuestionsList } from './configs';
import { getProjectRootPath } from './utils';
import type { DevReuslt } from './type.d';

const prompt = createPromptModule();

interface WebpackPageOptions {
  cmd: 'dev' | 'build';
  cwd?: string;
}

interface StartWebpackOptions {
  cmd: 'dev' | 'build';
  pageName: string;
}

/**
 * 开始调试页面，适用于脚手架场景
 *
 * @export
 * @param {DevPageOptions} options 参数
 * @returns 无
 */
export async function webpackPage(options: WebpackPageOptions): Promise<void> {
  if (options?.cwd) {
    process.chdir(options.cwd);
  }

  const { cmd } = options;
  const questions = getPromptQuestionsList();
  const answers = await prompt(questions);
  const { pageName } = answers;

  const devResult = await startWebpack({
    cmd,
    pageName,
  });

  if (devResult.isSuccess) {
    logger.success(`vice ${cmd} 运行成功`);
  } else {
    logger.error(`vice ${cmd} 运行失败：${devResult.message}`);
  }
}

/**
 * 调试页面的核心函数，适用于 API
 *
 * @param {string} [pageName=''] 页面名称
 * @returns 启动调试的结果
 */
async function startWebpack(options: StartWebpackOptions): Promise<DevReuslt> {
  const { cmd, pageName } = options;
  if (!pageName) {
    throw new Error(`[vise ${cmd}] pageName 无效`);
  }

  let webpackConfigs;
  if (cmd === 'dev') {
    webpackConfigs = getDevConfig({
      mode: 'development',
      projectRootPath: getProjectRootPath(),
      pageName,
    });
  } else if (cmd === 'build') {
    const prodConfig = getProdConfig({
      mode: 'production',
      projectRootPath: getProjectRootPath(),
      pageName,
    });
    const prodDllConfig = getProdDllConfig({
      mode: 'production',
      projectRootPath: getProjectRootPath(),
      pageName,
    });
    webpackConfigs = [prodDllConfig, prodConfig];
  }

  const hookManager = new WebpackPageHookManager();
  await hookManager.loadPlugin('', async () => getCustomedPlugin());
  return await hookManager.run(cmd, {
    pageName,
    webpackConfigs,
  });
}
