A convenient js lib for browser.

There are much excellent npm packages so that I don't really need to realize by myself. For example:
+ [url-parse](https://www.npmjs.com/package/url-parse)
+ [js-cookie](https://www.npmjs.com/package/js-cookie)

## Installation

```sh
$ npm install @hadeshe93/lib-browser --save
```

## Usage

Use it in `CJS` format:

```js
const { insertJs } = require('@hadeshe93/lib-browser');

// your application code
// ...
```

Use it in `ESM` format:

```js
import { insertJs } from '@hadeshe93/lib-browser';

// your application code
// ...
```

Use it in `IIFE` format:

```html
<script type="text/javascript" src="example.com/path/to/index.browser.iife.js"></script>
<script type="text/javascript">
  const { insertJs } = hdsLibBrowser;

  // your application code
  // ...
</script>
```