const path = require('path');
const { WebpackConfigHookManager, getDevConfig } = require('../../dist/index.node.cjs');

async function test() {
  const hookManager = new WebpackConfigHookManager();
  const devConfig = getDevConfig({
    projectRootPath: path.resolve(__dirname, './'),
  });
  hookManager.loadHooksFile(path.resolve(__dirname, './webpack.config.hooks.js'));
  const lastConfig = await hookManager.run(devConfig);
  console.log('devConfig: ', devConfig);
  console.log();
  console.log('lastConfig: ', lastConfig);
}

test();
