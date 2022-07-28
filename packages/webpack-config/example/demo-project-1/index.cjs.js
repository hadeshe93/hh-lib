const path = require('path');
const { WebpackConfigHookManager, getDevConfig } = require('../../dist/index.node.cjs');

async function test() {
  const hookManager = new WebpackConfigHookManager();
  await hookManager.loadPlugin(path.resolve(__dirname, './webpack.config.hooks.js'));
  const options = {
    projectRootPath: path.resolve(__dirname, './'),
    pageName: 'demo1',
  };
  const lastConfig = await hookManager.run({
    scene: 'dev',
    getDefaultConfig: getDevConfig,
    options,
  });
  // console.log('devConfig: ', devConfig);
  console.log();
  console.log('lastConfig: ', lastConfig);
}

test();
