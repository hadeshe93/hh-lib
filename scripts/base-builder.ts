import os from 'os';
import { runParallel } from './common/util';

export default abstract class BaseBuilder {
  targets: string[] = [];

  async buildAll(targets: string[]): Promise<any> {
    // 执行并行产物构建
    return await runParallel(os.cpus().length, targets, this.build.bind(this));
  }

  abstract build(target: string): Promise<any>;

  begin(): Promise<void> | void {
    // ...
    console.log('构建开始');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  end(results: any): Promise<void> | void {
    // ...
    console.log('构建完成~');
  }

  async run() {
    await this.begin?.();
    const results = await this.buildAll?.(this.targets);
    await this.end?.(results);
  }
}
