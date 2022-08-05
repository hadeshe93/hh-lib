import { Logger } from '../../core/logger';
import { Plugger } from '../../core/plugger';
import { Commander } from '../../core/commander';
import { Configuration } from '../../core/configuration';
import { ApplyPluginContext } from '../../typings/core';

export default {
  apply(ctx: ApplyPluginContext<Logger, Commander, Configuration>) {
    ctx.commander.register({
      command: 'install',
      description: 'Install plugin for vice flow',
      argumentList: [['pluginName', { required: true, description: 'Plugin name' }]],
      fn: async (params) => {
        const plugger = new Plugger({
          logger: ctx.logger,
          configuration: ctx.configuration,
        });
        await plugger.install(params.pluginName);
      },
    });
  },
};
