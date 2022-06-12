// import { getTypeOf } from '../../dist/index.browser.esm.js';
import { parseCallStack } from '../../dist/index.browser.esm.js';

// console.log(getTypeOf('123'));
console.log(parseCallStack(new Error()));