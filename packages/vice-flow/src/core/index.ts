import glob from 'glob';
import { logger, Logger } from './logger';
import { commander, getSandboxCommander, Commander } from './commander';
import { initiatorManager, getSandboxInitiatorManager, InitiatorManager } from './initiator';
import { configuration, Configuration } from './configuration';
import path from 'path';

export class ViceFlow {
  logger = logger;
  commander = commander;
  configuration = configuration;
  initiatorManager = initiatorManager;

  loadInternalPlugins() {
    const internalPluginsPath = path.resolve(__dirname, '../internal-plugins');
    const plugins = glob.sync(path.join(internalPluginsPath, '/*'));
    return plugins.map((partialName) => ({
      pluginName: `internal-${partialName}`,
      absolutePath: path.resolve(internalPluginsPath, partialName, 'index'),
    }));
  }

  async init() {
    // 遍历加载插件
    let { plugins } = this.configuration.data;
    plugins = this.loadInternalPlugins().concat(plugins);
    for (const plugin of plugins) {
      let pluginIns = require(plugin.absolutePath);
      pluginIns = pluginIns.default ?? pluginIns;
      await pluginIns.apply({
        logger: this.logger,
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
