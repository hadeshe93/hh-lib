const { parseCallStack } = require('../../dist/index.browser.cjs.js');

// console.log(getTypeOf('123'));
console.log(parseCallStack(new Error()));