import { Logger } from '../../core/logger';
import { InitiatorManager } from '../../core/initiator';
import { Commander } from '../../core/commander';
import { Configuration } from '../../core/configuration';
import { ApplyPluginContext } from '../../typings/core';

export default {
  apply(ctx: ApplyPluginContext<Logger, Commander, Configuration, InitiatorManager>) {
    ctx.commander.register({
      command: 'init',
      description: 'Init a application project from templates',
      fn: async () => {
        await ctx.initiatorManager.run();
      },
    });
  },
};
