// 分模块导出，减小包体积
import { getTypeOf } from '@hadeshe93/lib-common';

export * from './script';

console.log(getTypeOf('x'));
