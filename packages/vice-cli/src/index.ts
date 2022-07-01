import path from 'path';
import fs from 'fs-extra';
import commander from 'commander';
// import { camelize } from '@hadeshe93/lib-common';
import { getResolve } from '@hadeshe93/lib-node';

import { logger } from './libs/logger';
import { createProject } from './modules/create';

const program = new commander.Command();
const rootResolve = getResolve(path.resolve(__dirname, '../'));
const packageJson = fs.readJsonSync(rootResolve('package.json'));

program.version(packageJson.version).usage('<command> [options]');

program
  .command('create <app-name>')
  .description('Create a new project powered by vice')
  .action(async (appName) => {
    logger('arguments: ', appName);
    await createProject({ appName });
  });

program.on('--help', () => {
  console.log('');
  console.log('  Run vice <command> --help for detailed usage of given command.');
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
