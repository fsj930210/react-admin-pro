# @rap/commitlint-config

React Admin Pro 的 Commitlint 配置包，提供了项目的 Git 提交信息检查规则。

## 关键字

- Commitlint
- Git
- 提交信息
- 开发规范
- 团队协作

## 特性

- 提供统一的 Commitlint 配置
- 基于 Conventional Commits 规范
- 自定义的提交信息检查规则
- 与 Husky 集成，实现提交前检查
- 提高团队协作效率

## 配置内容

- 提交类型规则
- 提交信息格式规则
- 提交范围规则

## 使用方法

在项目的`commitlint.config.ts`文件中导入此配置：

```ts
import { defineConfig } from "@rap/commitlint-config";

export default defineConfig();
```

## 依赖

- @commitlint/config-conventional
- @commitlint/types
