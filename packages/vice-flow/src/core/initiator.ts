import Enquirer from 'enquirer';

import { logger } from './logger';
import { Interactor } from './interactor';
import { createSandboxInstanceCreator } from '../utils/sandbox';

export interface InitiatorDetail {
  pluginName?: string;
  templateName: string;
  fn: (...args) => Interactor | Promise<Interactor>;
}

type InitiatorMap<TemplateName extends string = string> = Map<TemplateName, InitiatorDetail>;

export class InitiatorManager {
  enquirer = Enquirer;
  logger = logger;
  initiatorMap: InitiatorMap = new Map();

  register(initiatorDetail: InitiatorDetail) {
    const existedDetail = this.initiatorMap.get(initiatorDetail.templateName);
    if (existedDetail) {
      this.logger.error(
        `Initiator '${initiatorDetail.templateName}' cannot be registered by ${initiatorDetail.pluginName} because of ${existedDetail.pluginName}`,
      );
      return false;
    }
    this.initiatorMap.set(initiatorDetail.templateName, initiatorDetail);
  }

  async run() {
    const details = [...this.initiatorMap.values()];
    const choices = details.map((detail) => detail.templateName);
    const question = {
      name: 'templateName',
      message: 'Please pick a initiator',
      limit: 10,
      initial: 0,
      choices,
    };
    const prompt = new Enquirer['AutoComplete'](question);
    const targetTemplateName = await prompt.run();
    const targetDetail = details.find((detail) => detail.templateName === targetTemplateName);
    if (!targetDetail) {
      this.logger.error(`Cannot find the initiator corresponded to template name: '${targetTemplateName}'`);
      process.exit(1);
    }
    const initiator = await targetDetail.fn();
    await initiator.run();
  }
}
export const initiatorManager = new InitiatorManager();

export const getSandboxInitiatorManager = createSandboxInstanceCreator<
  InitiatorManager,
  'register' | 'run',
  { pluginName: string }
>({
  register(managerIns, extraOptions, detail) {
    const { pluginName } = extraOptions || {};
    managerIns.register({
      pluginName,
      ...detail,
    });
  },
  run(managerIns) {
    managerIns.run();
  },
});
