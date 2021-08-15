![continous deploy action badge](https://github.com/hadeshe93/hh-lib/actions/workflows/ci-cd.yml/badge.svg)

该项目是的 monorepo 类型的组织形式。

## 安装项目依赖

开发该项目时，首先要安装项目下的依赖，以及各个包中的依赖，不同于一般项目，该项目所有依赖需要交给 `lerna` 来管理：
```bash
# 安装项目的基本依赖
$ yarn install

# 让 lerna 接管安装各个包中的依赖
$ npx lerna bootstrap
```

如果有需要给整个项目安装依赖的话，需要使用 `yarn` 命令在根目录单独安装，例如：
```bash
# 安装 --save-dev 依赖
# 项目单独安装依赖，需要加上 -W 标志位
$ yarn add @babel/eslint-parser --dev -W
```

## 创建新包

依旧使用 `lerna` 工具来创建新包：
```bash
$ npx lerna create <新包名>
```

由于这个项目里面每个包发布之后都会在 `@hadeshe` 空间下，比如 `packages/` 下已有的包与包名的对应关系：
+ `packages/browser`: `@hadeshe/lib-browser`
+ `packages/common`: `@hadeshe/lib-common`
+ `packages/node`: `@hadeshe/lib-node`

这个关系在各个包中的 `package.json` 中的 `name` 字段中有体现。

另外，在 `lerna` 的管理中，每个包的名字也是以 `package.json` 中的 `name` 为准及管理的。

## 给包安装依赖

项目根目录中已经包含了 `learn.json`，其中给 leran 设置了包管理工具为 `yarn`。

且项目根目录中的 `package.json` 中已经设置了 yarn 使用 `workspaces` 形式来安装管理依赖。

综上，已经将 `lerna` 和 `yarn` 很好地配置并结合在一起了，后面要做的就是给包安装依赖。

例如需要给 `packages/node` 安装 `--save` 类型 `axios` 的依赖：
```bash
# 默认就是以 --save 形式安装的
$ npx lerna add axios --scope=@hadeshe93/lib-node
```

## 修改包源码的原则

每次提交和提交 PR 请以包为单位，即每次只能修改一个包的内容，不要同时修改多个包的内容。否则，云端构建和推送会将 commit 信息应用到每个变更过的包的 `CHANGELOG.md` 中，会导致变更历史信息不太准确。

## 构建 & 发布包

不需要关注这个两个环节，因为在 github 上配置了 action 流水线，只要提交到 `main` 主干，就会自动执行流水线，其中会进行构建和发布。

综上，该项目配置了 CI 和 CD，开发者可以更专注于编码。
