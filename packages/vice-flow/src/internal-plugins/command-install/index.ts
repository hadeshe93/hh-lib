import { definePluigin } from '../../core';
import { Plugger } from '../../core/plugger';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'install',
      description: 'Install plugin for vice flow',
      argumentList: [['pluginName', { required: true, description: 'Plugin name' }]],
      fn: async (params) => {
        const plugger = new Plugger();
        await plugger.install(params.pluginName);
      },
    });
  },
});
