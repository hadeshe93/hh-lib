const fs = require('fs-extra');
const minimist = require('minimist');
const commander = require('commander');
const path = require('path');

const getResolve =
  (prefixPath) =>
  (...args) =>
    path.resolve(prefixPath, ...args);

function run() {
  const program = new commander.Command();
  const rootResolve = getResolve(path.resolve(__dirname, '../../'));
  const packageJson = fs.readJsonSync(rootResolve('package.json'));
  const CLI_NAME = 'vice';

  program.name(CLI_NAME).usage('<command> [options]').version(packageJson.version);
  // program
  //   .command('dev')
  //   .argument('[appName]', 'app name for developing')
  //   .allowUnknownOption()
  //   .description(`123 ${CLI_NAME}`)
  //   .action(async (...args) => {
  //     // console.log(args);
  //   });
  program
    .command('dev 123')
    .argument('[appName]', 'app name for developing')
    .allowUnknownOption()
    .description(`Create a new project powered by ${CLI_NAME}`)
    .action(async (...args) => {
      // console.log(args);
      console.log(minimist(args.slice(-1)[0].args));
    });
  // program.outputHelp();
  // console.log(process.argv);
  program.parse(process.argv);
}

run();
