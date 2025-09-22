# @rap/eslint-config

React Admin Pro 的 ESLint 配置包，提供了项目的代码检查规则。

## 关键字

- ESLint
- 代码检查
- 代码质量
- 开发工具
- 最佳实践

## 特性

- 提供统一的 ESLint 配置
- 支持 JavaScript 和 TypeScript
- 集成 React 和 React Hooks 规则
- 集成 TanStack Query 和 Router 规则
- 自定义的代码检查规则

## 配置内容

- JavaScript/TypeScript 规则
- React 和 React Hooks 规则
- TanStack Query 和 Router 规则
- 最佳实践和代码风格规则

## 使用方法

在项目的`eslint.config.mjs`文件中导入此配置：

```js
import { createConfig } from "@rap/eslint-config";

export default createConfig();
```

## 依赖

- eslint
- @eslint/js
- @eslint-react/eslint-plugin
- @tanstack/eslint-plugin-query
- @tanstack/eslint-plugin-router
- @typescript-eslint/eslint-plugin
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
