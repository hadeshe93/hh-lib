import { createPromptModule } from 'inquirer';
import { CreateHookManager } from './hooks-manager';
import { getCustomedCreatePlugin } from './plugins';
import { logger } from '../../libs/logger';
import { getPromptQuestionsList } from './configs';

const prompt = createPromptModule();

interface CreateProjectParams {
  appName: string;
}

export async function createProject(params: CreateProjectParams) {
  const hookManager = new CreateHookManager();
  const configs = await hookManager.loadPlugin('', async () => getCustomedCreatePlugin());
  logger('configs: ', configs);

  const questions = getPromptQuestionsList();
  const answers = await prompt(questions);
  const { createOptions } = answers;
  logger('createOptions: ', createOptions);

  const createResult = await hookManager.run({
    ...createOptions,
    appName: params.appName,
  });
  logger('createResult: ', createResult);
}
