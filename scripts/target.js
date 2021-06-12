const fs = require('fs');
const minimist = require('minimist');

// 获取所有可以被构建的 packages
const getAllTargets = () =>
  fs.readdirSync('packages').filter((f) => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
      return false;
    }
    const pkg = require(`../packages/${f}/package.json`);
    if (pkg.private || !pkg.buildOptions) {
      return false;
    }
    return true;
  });

// 获取命令行指定要构建的 package
const getTargets = () => minimist(process.argv.slice(2))._;

module.exports = {
  getAllTargets,
  getTargets,
};
