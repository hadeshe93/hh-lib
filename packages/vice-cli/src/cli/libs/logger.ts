import ora from 'ora';
import chalk from 'chalk';

import { format } from 'util';

type LogFn = (...args: any[]) => void;
export interface Logger {
  (...args: any[]): void;
  error: LogFn;
  warn: LogFn;
  success: LogFn;
  ing: (msg: string, func?: (...args: any[]) => any) => ora.Ora | Promise<ora.Ora>;
}

/**
 * Log a message to the console.
 *
 * @param {...any} args
 */
function log(...args: any) {
  const msg = format.apply(format, args);
  console.log(chalk.white(' '), msg);
}

/**
 * Log an error message to the console and exit.
 *
 * @param {...any} args
 */
function error(...args: any) {
  let message = args[0];
  if (message instanceof Error) message = message.message.trim();
  const msg = format.apply(format, args);
  console.error(chalk.red('✖'), chalk.red(msg));
}

/**
 * Log an error `message` to the console.
 *
 * @param {...any} args
 */
function warn(...args: any) {
  let message = args[0];
  if (message instanceof Error) message = message.message.trim();
  const msg = format.apply(format, args);
  console.warn(chalk.yellow('⚠'), chalk.yellow(msg));
}

/**
 * Log an success message to the console.
 *
 * @param {...any} args
 */
function success(...args: any) {
  const msg = format.apply(format, args);
  console.log(chalk.green('✔︎'), chalk.green(msg));
}

/**
 * Log a ing message to the console.
 *
 * @param {*} msg
 * @param {*} [func]
 * @returns
 */
function ing(msg, func?): ora.Ora | Promise<ora.Ora> {
  const sipnner = ora({
    text: msg,
    color: 'cyan',
  }).start();

  if (func instanceof Function) {
    const promise = func(sipnner);
    if (promise instanceof Promise) {
      return promise.then(() => sipnner.stop()).catch(() => sipnner.stop());
    } else {
      return sipnner.stop();
    }
  } else {
    return sipnner;
  }
}

log.error = error;
log.warn = warn;
log.success = success;
log.ing = ing;

const logger: Logger = log;
export default logger;
