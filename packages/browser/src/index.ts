// 分模块导出，减小包体积
import { getTypeOf } from '@hadeshe93/lib-common';

export * as script from './script';

console.log(getTypeOf.getTypeOf('x'));