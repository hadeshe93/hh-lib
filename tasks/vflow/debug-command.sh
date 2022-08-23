#!/bin/bash

# 开发项目的路径
# dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-react-antd"
# dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-vue3-element"
# dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-vue3"
dev_project_path="/cbs/xcode/webpack5-starter/packages/webpack5-react"

if [[ $1 == "ls" ]]
then
  pnpm --filter @hadeshe93/vflow dev:flow ls
elif [[ $1 == "init" ]]
then
  pnpm --filter @hadeshe93/vflow dev:flow init
elif [[ $1 == "spa:dev" ]]
then
  pnpm --filter @hadeshe93/vflow dev:flow spa:dev -- --cwd "$dev_project_path"
elif [[ $1 == "spa:build" ]]
then
  pnpm --filter @hadeshe93/vflow dev:flow spa:build -- --cwd "$dev_project_path"
elif [[ $1 == "spa:deploy" ]]
then
  # pnpm --filter @hadeshe93/vflow dev:flow spa:deploy --help
  pnpm --filter @hadeshe93/vflow dev:flow spa:deploy -- --cwd "$dev_project_path"
else
  echo "没有符合的条件"
fi