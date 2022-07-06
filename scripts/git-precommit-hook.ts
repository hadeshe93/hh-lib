import path from 'path';
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
  const tsFileExisted = fileList.findIndex((fileName) => /(\.d)?\.ts$/.test(path.basename(fileName))) >= 0;
  if (!tsFileExisted) return;
  await execa('turbo', ['run', 'buildDocsMeta', '--filter=!./apps/*'], { stdio: 'inherit' });
  await execa('turbo', ['run', 'buildDocs'], { stdio: 'inherit' });
}

main();
