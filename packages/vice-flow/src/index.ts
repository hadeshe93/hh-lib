// export { ViceFlow } from './core/index';

import { ViceFlow } from './core/index';

if (process.env['RUN']) {
  new ViceFlow().run();
}

export { ViceFlow };
