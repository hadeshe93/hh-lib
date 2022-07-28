#!/bin/bash

# 开发项目的路径
dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-starter-vue3-ts"

if [[ $1 == "dev" ]]
then
  pnpm --filter @hadeshe93/vice-cli dev:cli dev --cwd "$dev_project_path" --test 123 --asd abc
elif [[ $1 == "build" ]]
then
  pnpm --filter @hadeshe93/vice-cli dev:cli build --cwd "$dev_project_path"
else
  echo "没有符合的条件"
fi
