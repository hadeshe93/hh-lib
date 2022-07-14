import { createPromptModule } from 'inquirer';
import { CreateHookManager } from './hooks-manager';
import { getCustomedCreatePlugin } from './plugins';
import { getPromptQuestionsList } from './configs';

const prompt = createPromptModule();

interface CreateProjectParams {
  appName: string;
}

export async function createProject(params: CreateProjectParams) {
  const hookManager = new CreateHookManager();
  await hookManager.loadPlugin('', async () => getCustomedCreatePlugin());

  const questions = getPromptQuestionsList();
  const answers = await prompt(questions);
  const { createOptions } = answers;

  await hookManager.run({
    ...createOptions,
    appName: params.appName,
  });
}
