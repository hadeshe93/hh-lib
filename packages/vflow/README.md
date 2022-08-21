A convenient scaffold named vice.

## Installation

```sh
$ npm install @hadeshe93/vice-cli -g
```

## Usage

```sh
# get instructions
$ vice --help

# create a new project according to preset template
$ vice create

# start to dev project created by vice
$ vice dev

# start to build project created by vice
$ vice build
```

## Development Vice

For example:

```sh
# start to development dev command
$ pnpm --filter @hadeshe93/vice-cli dev dev --cwd /cbs/xcode/webpack5-starter/packages/webpack5-starter-vue3-ts

# start to development build command
$ pnpm --filter @hadeshe93/vice-cli dev build --cwd /cbs/xcode/webpack5-starter/packages/webpack5-starter-vue3-ts
```