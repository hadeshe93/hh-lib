import glob from 'glob';
import { Logger } from './logger';
import { Commander, getSandboxCommander } from './commander';
import { InitiatorManager, getSandboxInitiatorManager } from './initiator';
import { Configuration } from './configuration';
import path from 'path';

export class ViceFlow {
  logger = new Logger();
  commander = new Commander({
    logger: this.logger,
  });
  configuration = new Configuration();
  initiatorManager = new InitiatorManager();

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
