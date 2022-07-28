import path from 'path';
import fs from 'fs-extra';
import minimist from 'minimist';
import commander from 'commander';
// import { camelize } from '@hadeshe93/lib-common';
import { getResolve } from '@hadeshe93/lib-node';

import logger from './libs/logger';
import { createProject } from './modules/create';
import { webpackPage } from './modules/webpack';

const CLI_NAME = 'vice';

export function run() {
  const program = new commander.Command();
  const rootResolve = getResolve(path.resolve(__dirname, '../../'));
  const packageJson = fs.readJsonSync(rootResolve('package.json'));

  program.name(CLI_NAME).usage('<command> [options]').version(packageJson.version);

  program
    .command('create <app-name>')
    .description(`Create a new project powered by ${CLI_NAME}`)
    .action(async (appName) => {
      logger('arguments: ', appName);
      await createProject({ appName });
    });

  /**
   * 运行场景：
   * 1. 工程项目根目录下
   * 2. 工程项目指定页面目录下
   * 3. 其他无关路径下启动工程项目
   */
  program
    .command('dev')
    .option('--cwd <path>', 'current working directory path')
    .allowUnknownOption()
    .description(`Dev page powered by ${CLI_NAME}`)
    .action(async (options, cmdIns) => {
      console.log('dev options:', options);
      console.log('dev args:', minimist(cmdIns.args));
      // await webpackPage({
      //   ...options,
      //   cmd: 'dev',
      // });
    });

  program
    .command('build')
    .option('--cwd <path>', 'current working directory path')
    .description(`Build page powered by ${CLI_NAME}`)
    .action(async (options = {}) => {
      await webpackPage({
        ...options,
        cmd: 'build',
      });
    });

  program.on('--help', () => {
    console.log('');
    console.log(`  Run ${CLI_NAME} <command> --help for detailed usage of given command.`);
  });

  process.on('beforeExit', (code) => {
    logger('进程 beforeExit 事件的代码: ', code);
  });

  process.on('exit', (code) => {
    if (code === 0) return;
    logger('进程 exit 事件的代码: ', code);
  });

  process.on('uncaughtException', (err: any) => {
    logger('进程未捕获到的异常：', err);
  });

  process.on('unhandledRejection', (reason: any, promise: any) => {
    logger('进程未处理的 rejection：', promise, '原因：', reason);
  });

  // 解析命令行参数
  program.parse(process.argv);
}

if (process.env['RUN'] === '1') {
  console.log('[cli] 直接运行');
  run();
}

// function cleanArgs(cmd: any): Record<string, string> {
//   const args = {};
//   cmd.options.forEach((o) => {
//     const key = camelize(o.long.replace(/^--/, ''));

//     if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
//       args[key] = cmd[key];
//     }
//   });
//   return args;
// }
