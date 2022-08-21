import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'ls',
      description: 'List all configs of vice flow',
      fn: async () => {
        ctx.logger.success('Configs of Vice Flow:\r\n', JSON.stringify(ctx.configuration.data, null, 2));
      },
    });
  },
});
