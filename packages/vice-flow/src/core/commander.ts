import path from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';
import commander from 'commander';
import { getResolve } from '@hadeshe93/lib-node';
import { Logger } from './logger';

type CommandArgumentItem = [
  string,
  {
    description: string;
    required?: boolean;
  },
];
type CommandOptionMap = Record<
  string,
  {
    description: string;
    alias?: string;
  }
>;
interface CommandDetail {
  command: string;
  description: string;
  fn: (...args: any) => void | Promise<void>;
  pluginName?: string;
  argumentList?: CommandArgumentItem[];
  optionMap?: CommandOptionMap;
  allowUnknownOption?: boolean;
}

interface CommanderOptions {
  logger: undefined | Logger;
}

export class Commander {
  logger: Logger;
  commandsMap: Map<string, CommandDetail> = new Map();
  program = new commander.Command();

  constructor(options: CommanderOptions) {
    this.logger = options.logger;
    this.initProgram();
  }

  initProgram() {
    const CLI_NAME = 'vflow';
    const rootResolve = getResolve(path.resolve(__dirname, '../../'));
    const packageJson = fs.readJsonSync(rootResolve('package.json'));
    this.program.name(CLI_NAME).usage('<command> [options]').version(packageJson.version);
    this.program.on('--help', () => {
      console.log('');
      console.log(`  Run ${CLI_NAME} <command> --help for detailed usage of given command.`);
    });
  }

  register(commandDetail: CommandDetail) {
    const { command: commandName } = commandDetail;
    const existedCommandDetail = this.commandsMap.get(commandName);
    if (existedCommandDetail) {
      this.logger.error(
        `Command '${commandName}' cannot be registered by ${commandDetail.pluginName} because of ${existedCommandDetail.pluginName}`,
      );
      return false;
    }
    this.commandsMap.set(commandName, commandDetail);

    // 设置 command
    const commandDefinition = this.program.command(commandName).description(commandDetail.description);
    if (commandDetail.argumentList) {
      let doneRequired = false;
      commandDetail.argumentList.forEach(([argumentName, argumentInfo]) => {
        // 禁止有 required 在后面才定义，必须放到前面来
        if (doneRequired && argumentInfo.required) {
          this.logger.error(
            `Required argument need to be put ahead of others when registering command '${commandName}' in plugin '${commandDetail.pluginName}'`,
          );
        } else {
          commandDefinition.argument(
            argumentInfo.required ? `<${argumentName}>` : `[${argumentName}]`,
            argumentInfo.description,
          );
        }
        if (!argumentInfo.required) {
          doneRequired = true;
        }
      });
    }
    if (commandDetail.optionMap) {
      Object.entries(commandDetail.optionMap).forEach(([optionName, optionInfo]) => {
        const names = [optionInfo.alias ? `-${optionInfo.alias}` : '', `--${optionName}`].filter((str) => !!str);
        commandDefinition.option(names.join(', '), optionInfo.description);
      });
    }
    const disposeActionArgs = getActionArgsDisposal(commandDetail);
    commandDefinition.action((...actionArgs: any[]) => {
      const { args = [] } = actionArgs.slice(-1)[0];
      commandDetail.fn(disposeActionArgs(args));
    });
  }

  run() {
    process.on('beforeExit', (code) => {
      this.logger.log(`Code before process's exiting is ${code}`);
    });
    process.on('exit', (code) => {
      if (code === 0) return;
      this.logger.log(`'Process exit code is ${code}`);
    });
    process.on('uncaughtException', (err: any) => {
      this.logger.error('Uncaught exception:', err);
    });
    process.on('unhandledRejection', (reason: any, promise: any) => {
      this.logger.error('Unhandled rejection: ', promise, 'reason: ', reason);
    });
    this.program.parse(process.argv);
  }
}

interface OptionsForGetSandboxCommander {
  pluginName: string;
}
export function getSandboxCommander(commanderIns: Commander, options: OptionsForGetSandboxCommander) {
  const sandboxCommander = Object.create(null);
  sandboxCommander.register = (commandDetail: CommandDetail) => {
    const { pluginName } = options || {};
    const { command, description, fn, argumentList = [], optionMap = {} } = commandDetail || {};
    commanderIns.register({
      command,
      description,
      fn,
      argumentList,
      optionMap,
      pluginName,
    });
  };
  return sandboxCommander;
}

export function getActionArgsDisposal(commandDetail: CommandDetail) {
  const { argumentList } = commandDetail;
  const argumentNameList = (argumentList || []).map(([argumentName]) => argumentName);
  return (args: any[]) => {
    const result = minimist(args);
    const { _: argumentArgs, ...restMap } = result;
    const argumentMap = (argumentArgs || []).reduce((map, argVal, idx) => {
      map[argumentNameList[idx]] = argVal;
      return map;
    }, {});
    return {
      ...argumentMap,
      ...restMap,
    };
  };
}
