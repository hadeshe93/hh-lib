const path = require('path');
const { CommonConfig, VueConfig, ReactConfig } = require('../../dist/index.node.cjs');

async function test() {
  const options = {
    projectRootPath: path.resolve(__dirname, './'),
    pageName: 'demo1',
  };
  const commonConfigIns = new CommonConfig(options);
  const commonDevConfig = await commonConfigIns.getCommonConfig();
  console.log(commonDevConfig);

  const vueConfigIns = new VueConfig(options);
  const vueDevConfig = await vueConfigIns.getDevConfig();
  console.log(vueDevConfig);

  const reactConfigIns = new ReactConfig(options);
  const reactDevConfig = await reactConfigIns.getDevConfig();
  console.log(reactDevConfig);
}

test();
