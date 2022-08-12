import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.commander.register({
      command: 'ls',
      description: 'List all configs of vice flow',
      fn: async () => {
        console.log(JSON.stringify(ctx.configuration.data, null, 2));
      },
    });
  },
});
