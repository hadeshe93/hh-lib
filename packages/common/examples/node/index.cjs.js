const { parseCallStack } = require('../../dist/index.node.cjs.js');

// console.log(getTypeOf('123'));
console.log(parseCallStack(new Error()));