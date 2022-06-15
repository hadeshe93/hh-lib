![continous deploy action badge](https://github.com/hadeshe93/hh-lib/actions/workflows/ci-cd.yaml/badge.svg)

该项目是的 monorepo 类型的组织形式，通过 `pnpm` 来进行包的依赖管理。

## 安装项目依赖

开发该项目时，首先要安装项目下的依赖，以及各个包中的依赖，不同于一般项目，该项目所有依赖需要交给 `pnpm` 来管理：
```bash
# 安装项目的基本依赖
$ pnpm install
```

根目录单独安装依赖：
```bash
$ pnpm add --save-dev/--save-prod <pkgName> -W
```

某个 package 单独安装依赖：
```bash
$ pnpm add --save-dev/--save-prod <pkgName> --filter <pkgSelector>
```

## 创建新包

直接在 `packages/` 目录下创建文件夹，然后用 `pnpm init` 就好。

由于这个项目里面每个包发布之后都会在 `@hadeshe` 空间下，比如 `packages/` 下已有的包与包名的对应关系：
+ `packages/browser`: `@hadeshe/lib-browser`
+ `packages/common`: `@hadeshe/lib-common`
+ `packages/node`: `@hadeshe/lib-node`

这个关系在各个包中的 `package.json` 中的 `name` 字段中有体现。

另外，在 `pnpm` 的管理中，每个包的名字也是以 `package.json` 中的 `name` 为准及管理的。


## 修改包源码的原则

每次提交和提交 PR 请以包为单位，即每次只能修改一个包的内容，不要同时修改多个包的内容。否则，云端构建和推送会将 commit 信息应用到每个变更过的包的 `CHANGELOG.md` 中，会导致变更历史信息不太准确。

## 构建 & 发布包

不需要关注这个两个环节，因为该仓库配置了 [changeset-bot](https://github.com/apps/changeset-bot) 和 actions，关注于 PR 及合并时触发流水线构建。

综上，开发者可以更专注于编码。

## 代码提交规范

我们提交代码时需要根据规范来执行，默认通过 `@commitlint/config-conventional` 包来进行 `commitlint`。

提交类型有：
+ `build`
+ `chore`
+ `ci`
+ `docs`
+ `feat`
+ `fix`
+ `perf`
+ `refactor`
+ `revert`
+ `style`
+ `test`