import path from 'path';
import execa from 'execa';

async function main() {
  const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
  const fileList = stdout.split('\n');
  const tsFileExisted = fileList.findIndex((fileName) => /(\.d)?\.ts$/.test(path.basename(fileName))) >= 0;
  if (!tsFileExisted) return;
  await execa('turbo', ['run', 'buildDocsMeta'], { stdio: 'inherit' });
  await execa('turbo', ['run', 'buildDocs'], { stdio: 'inherit' });
}

main();
