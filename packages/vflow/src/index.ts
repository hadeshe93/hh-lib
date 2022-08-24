// export { ViceFlow } from './core/index';
import { init as initProcess } from './utils/process';
import { ViceFlow } from './core/index';
import { logger } from './core/logger';

initProcess(logger);
if (process.env['RUN']) {
  new ViceFlow().run();
}

export { ViceFlow };
