#!/bin/bash

# 开发项目的路径
dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-starter-react-ts"

if [[ $1 == "dev" ]]
then
  pnpm --filter @hadeshe93/vice-flow dev:flow spa:dev -- --cwd "$dev_project_path"
elif [[ $1 == "build" ]]
then
  pnpm --filter @hadeshe93/vice-flow dev:flow spa:build -- --cwd "$dev_project_path"
elif [[ $1 == "init" ]]
then
  pnpm --filter @hadeshe93/vice-flow dev:flow init
elif [[ $1 == "ls" ]]
then
  pnpm --filter @hadeshe93/vice-flow dev:flow ls
else
  echo "没有符合的条件"
fi
