import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { CustomedWebpackConfigs } from '@hadeshe93/webpack-config';

async function excuteOrderedTask(fns: ((...args: any) => any)[], order: 'serial' | 'parallel' = 'serial') {
  if (order === 'parallel') {
    return await Promise.all(fns.map((fn) => fn()));
  }
  if (order === 'serial') {
    const result = [];
    for (const fn of fns) {
      result.push(await fn());
    }
    return result;
  }
}

export async function doDev(configs: CustomedWebpackConfigs[], order: 'serial' | 'parallel' = 'serial') {
  const doSingleDev = (config: CustomedWebpackConfigs) => {
    const compiler = webpack(config);
    const devServerOptions = { ...config.devServer, open: false };
    const server = new WebpackDevServer(devServerOptions, compiler);
    server.start();
  };
  return await excuteOrderedTask(
    configs.map((config) => () => doSingleDev(config)),
    order,
  );
}

export async function doBuild(configs: CustomedWebpackConfigs[], order: 'serial' | 'parallel' = 'serial') {
  const doSingleBuild = (config: CustomedWebpackConfigs) =>
    new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
          console.error(err.stack || err);
          reject(err);
          return;
        }
        if (stats.hasErrors()) {
          const errors = stats.toJson().errors;
          console.error(errors);
          reject(errors);
          return;
        }
        console.log(
          stats.toString({
            colors: true,
          }),
        );
        resolve(stats);
      });
    });

  return await excuteOrderedTask(
    configs.map((config) => () => doSingleBuild(config)),
    order,
  );
}
