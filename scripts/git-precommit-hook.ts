import execa from 'execa';

/**
 * 主入口函数
 *
 * @description 检查到提交了 *.ts 或 *.d.ts 文件时，执行文档构建，构建完补充提交
 * @returns 无
 */
async function main() {
  const { stdout } = await execa('git', ['diff', '--cached', '--name-only']);
  const fileList = stdout.split('\n');
  const tsFileExisted = fileList.findIndex((fileName) => /^\.changeset\/[\s\S]+\.md$/.test(fileName)) >= 0;
  if (!tsFileExisted) return;
  await execa('turbo', ['run', 'build:doc:meta', '--filter=./packages/*'], { stdio: 'inherit' });
  await execa('turbo', ['run', 'build:docs', '--filter=./apps/docs'], { stdio: 'inherit' });
  await execa('git', ['add'], { stdio: 'inherit' });
}

main();
