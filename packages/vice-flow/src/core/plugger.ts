import execa from 'execa';
import { Logger } from './logger';
import { Configuration } from './configuration';

import { PluginDetail } from '@/typings/core';

interface InstallOptions {
  absolutePath?: string;
}

interface PluggerOptions {
  logger: Logger;
  configuration: Configuration;
}

export class Plugger {
  pluginsMap: Map<string, PluginDetail> = new Map();
  logger: undefined | Logger;
  configuration: undefined | Configuration;

  constructor(options: PluggerOptions) {
    this.logger = options.logger;
    this.configuration = options.configuration;

    // 读取配置文件进行初始化
    const { plugins = [] } = this.configuration.data;
    plugins.forEach((pluginDetail) => {
      this.pluginsMap.set(pluginDetail.name, pluginDetail);
    });
  }

  private async installPkg(rawPkgName: string) {
    try {
      await execa('pnpm', ['install', rawPkgName], { stdio: 'inherit' });
    } catch (err) {
      this.logger.error(`Error occurred in installing package '${rawPkgName}'`);
      process.exit(1);
    }
  }

  // 安装插件
  async install(rawPkgName: string, options?: InstallOptions) {
    await this.installPkg(rawPkgName);

    let name = '';
    const tempPkgNameBuff = rawPkgName.split('@');
    const tempPkgNameBuffLen = tempPkgNameBuff.length;

    if (rawPkgName.startsWith('@') && tempPkgNameBuffLen === 2) {
      name = rawPkgName;
    } else if (!rawPkgName.startsWith('@')) {
      name = tempPkgNameBuff[0];
    } else {
      name = tempPkgNameBuff.slice(0, -1).join('@');
    }

    const pluginDetail = this.pluginsMap.get(name) || ({} as PluginDetail);
    pluginDetail.name = name;
    const absolutePath = options?.absolutePath || require.resolve(name);
    pluginDetail.absolutePath = absolutePath;

    // 回写 pluginDetail
    this.pluginsMap.set(name, pluginDetail);

    // 回写配置文件进行固化
    this.configuration.data.plugins = [...this.pluginsMap.values()];
    await this.configuration.save();
  }

  // 加载运行所有插件
  loadAll(viceFlow: any) {
    const entries = this.pluginsMap.entries();
    for (const entry of entries) {
      const [, pluginDetail] = entry;
      require(pluginDetail.absolutePath)(viceFlow);
    }
  }
}
