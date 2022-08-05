import Enquirer from 'enquirer';
import { Editor } from 'mem-fs-editor';

import { logger } from './logger';
import { createMemFsCreator } from '../utils/memfs';
import { createSandboxInstanceCreator } from '../utils/sandbox';

const createMemFs = createMemFsCreator();
export interface InitiatorCtx {
  dest: string;
  [customedKey: string]: any;
}

export abstract class Initiator {
  private fs = createMemFs();
  private enquirer = Enquirer;
  protected logger = logger;
  protected ctx: InitiatorCtx = {
    dest: '',
  };

  constructor() {
    this.ctx.dest = process.cwd();
  }

  async initialize(): Promise<void> {
    // ...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prompt(enquirer: typeof Enquirer): Promise<void> {
    // ...
  }

  async end(): Promise<void> {
    // ...
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(fs: Editor): Promise<void> {
    // ...
  }

  private async write(fs: Editor, filtersOrStream?): Promise<void> {
    return new Promise((resolve) => {
      // 从内存中将文件均固化到磁盘中
      const argsForCommit = [
        (arg) => {
          resolve(arg);
        },
      ];
      if (filtersOrStream) argsForCommit.unshift(filtersOrStream);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fs.commit(...argsForCommit);
    });
  }

  onError(err) {
    if (!err) return;
    this.logger.error('Error occurred when downloading template repo:', err);
  }

  async run() {
    try {
      await this.initialize?.();
      await this.prompt?.(this.enquirer);
      await this.generate?.(this.fs);
      await this.write?.(this.fs);
      await this.end?.();
      this.logger.success('Initialization has been done. Enjoy it~');
    } catch (err) {
      await this.onError?.(err);
    }
  }
}

export interface InitiatorDetail {
  pluginName?: string;
  templateName: string;
  fn: (...args) => Initiator | Promise<Initiator>;
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

interface OptionsForGetSandboxInitiatorManager {
  pluginName: string;
}

export function getSandboxInitiatorManager2(
  managerIns: InitiatorManager,
  options: OptionsForGetSandboxInitiatorManager,
) {
  const sandboxManager = Object.create(null);
  // 代理 register 方法
  sandboxManager.register = (detail: InitiatorDetail) => {
    const { pluginName } = options || {};
    const { templateName, fn } = detail || {};
    managerIns.register({
      templateName,
      pluginName,
      fn,
    });
  };
  // 代理 run 方法
  sandboxManager.run = () => {
    managerIns.run();
  };
  return sandboxManager;
}

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
