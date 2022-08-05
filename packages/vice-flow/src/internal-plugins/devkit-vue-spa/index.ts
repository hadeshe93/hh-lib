import { VueTsSpaInitiator } from './initiator';
import { DevManager } from './dev-manager';
import { definePluigin } from '../../core';

export default definePluigin({
  apply(ctx) {
    ctx.initiatorManager.register({
      templateName: 'webpack5-starter-vue3-ts',
      fn: () => {
        return new VueTsSpaInitiator();
      },
    });

    ctx.commander.register({
      command: 'vs:dev',
      description: 'Develope project of vue spa',
      optionMap: {
        cwd: {
          typeVal: 'string',
          description: 'Specify current working directory',
        },
      },
      fn: (options) => {
        const devManager = new DevManager();
        console.log('===> options:', options);
        devManager.run(options);
      },
    });
  },
});
