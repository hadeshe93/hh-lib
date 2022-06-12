// import { getTypeOf } from '../../dist/index.node.esm.js';
import { parseCallStack } from '../../dist/index.node.esm.js';

// console.log(getTypeOf('123'));
console.log(parseCallStack(new Error()));