import path from 'path';
import glob from 'glob';

import { logger, Logger } from './logger';
import { commander, getSandboxCommander, Commander } from './commander';
import { initiatorManager, getSandboxInitiatorManager, InitiatorManager } from './initiator';
import { configuration, Configuration } from './configuration';
import { plugger, Plugger } from './plugger';
import { getInternalPluginName } from '../utils/plugin';

export class ViceFlow {
  logger = logger;
  plugger = plugger;
  commander = commander;
  configuration = configuration;
  initiatorManager = initiatorManager;

  installInternalPlugins() {
    const internalPluginsPath = path.resolve(__dirname, '../internal-plugins');
    const pluginPaths = glob.sync(path.join(internalPluginsPath, '/*'));
    const plugins = pluginPaths.map((pluginPath) => ({
      pluginName: getInternalPluginName(pluginPath),
      absolutePath: path.resolve(pluginPath, 'index'),
    }));
    plugins.forEach((plugin) => {
      plugger.install(plugin.pluginName, { absolutePath: plugin.absolutePath, fromLocal: true });
    });
  }

  async init() {
    // 安装内部插件
    this.installInternalPlugins();

    // 遍历加载插件
    const { plugins } = this.configuration.data;
    for (const plugin of plugins) {
      let pluginIns = require(plugin.absolutePath);
      pluginIns = pluginIns.default ?? pluginIns;
      await pluginIns.apply({
        logger: this.logger,
        plugger: this.plugger,
        configuration: this.configuration,
        commander: getSandboxCommander(this.commander, {
          pluginName: plugin.name,
        }),
        initiatorManager: getSandboxInitiatorManager(this.initiatorManager, {
          pluginName: plugin.name,
        }),
      });
    }
  }

  async run() {
    await this.init();
    // 启动 commander
    this.commander.run();
  }
}

interface UserPluginApplyContext {
  logger: Logger;
  plugger: Plugger;
  commander: Commander;
  configuration: Configuration;
  initiatorManager: InitiatorManager;
}
export interface UserPlugin {
  apply: (ctx: UserPluginApplyContext) => void | Promise<void>;
}
export function definePluigin(userPlugin: UserPlugin): UserPlugin {
  return userPlugin;
}
