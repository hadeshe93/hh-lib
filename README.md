![continous deploy action badge](https://github.com/hadeshe93/hh-lib/actions/workflows/cicd.yaml/badge.svg)

[![Coverage Status](https://coveralls.io/repos/github/hadeshe93/hh-lib/badge.svg?branch=main)](https://coveralls.io/github/hadeshe93/hh-lib?branch=main)

该项目是的 monorepo 类型的组织形式，并采用了当下最先进和快速的工作流方案：
1. 通过 `pnpm` 来进行包的依赖管理；
2. 通过 `changeset` 来进行 `packages` 的版本和发布管理；
3. 通过 `turbo` 来进行脚本命令的快速执行和构建产物的缓存；



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


## 构建 & 发布包

不态需要关注这个两个环节，因为该仓库配置了 [changeset-bot](https://github.com/apps/changeset-bot) 和 [changesets/action](https://github.com/changesets/action/tree/6a46d2c28377497e64763ba5f1faeabbd3d88c33)，关注于 PR 及合并时触发流水线构建。

完整的工作流应该是这样的：
1. 开发者在本地通过 `main` 主干拉出来特性分支（比如 `feature/hadeshe93_browser`）进行开发；
2. 开发完成后，本地根目录执行 `pnpm changeset`，会进入 REPL 模式让开发者勾选本次的改动对象和相对版本；
3. 完成 2 后，会在 `.changeset` 目录自动产生一些记录不同包变动的 markdown 文档，我们需要将他们进行 `git add` 和 `git commit`；
4. 将特性分支 `git push` 到远程仓库，然后顺势创建一个 PR，等待仓库主人（其实都是我自己哈哈） Review 和 Merge；
5. 创建 PR 之后，会自动触发一次 CI 流水线，去执行 `test` 脚本，让仓库主人看看本次变动是否会影响到单测的成功率；
6. 仓库主人觉得 PR 没问题之后，就要点击一下「merge」，合并到 `main` 主干；
7. MR 到 main 会自动触发 CD 流水线，其中的 `changesets/action` 会先创建一条分支 `changeset-release/main`，然后判断本次合并是否包含第 3 步中产生的 markdown 文档，然后会根据里面的内容判断是否需要自动执行 `changeset version` 来提升相关包的版本；如果是有提升版本的话，会继续通过 `changeset-release/main` 分支来创建一个合并到 `main` 主干的 PR 给到仓库主人；
8. 仓库主人可以不着急合并这个 PR，因为每一次有前面 7 个步骤的变更，都会融合到这个 PR 里面去，仓库主人可以择时合并，达到多个特性 PR 合并到一个「版本提升」中去。

综上，开发者可以更专注于编码，而仓库主人要懂得管理 PR 和区分包的版本特性。

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