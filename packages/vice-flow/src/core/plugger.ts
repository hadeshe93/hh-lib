import execa from 'execa';
import { logger } from './logger';

import { PluginDetail } from '../types/core';
import { configuration } from './configuration';

interface InstallOptions {
  absolutePath?: string;
  fromLocal?: boolean;
}

export class Plugger {
  pluginsMap: Map<string, PluginDetail> = new Map();
  logger = logger;
  configuration = configuration;

  constructor() {
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
    if (!options?.fromLocal) {
      await this.installPkg(rawPkgName);
    }

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
    pluginDetail.config = pluginDetail.config ?? {};

    // 回写 pluginDetail
    this.pluginsMap.set(name, pluginDetail);

    // 回写配置文件进行固化
    this.configuration.data.plugins = [...this.pluginsMap.values()];
    await this.configuration.save();
  }

  // 加载运行所有插件
  protected loadAll(viceFlow: any) {
    const entries = this.pluginsMap.entries();
    for (const entry of entries) {
      const [, pluginDetail] = entry;
      require(pluginDetail.absolutePath)(viceFlow);
    }
  }
}

export const plugger = new Plugger();
