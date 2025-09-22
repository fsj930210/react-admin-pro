# @rap/rsbuild-config

React Admin Pro 的 Rsbuild 配置包，提供了项目的构建配置。

## 关键字

- Rsbuild
- 构建工具
- 性能优化
- 开发体验
- 配置预设

## 特性

- 提供统一的 Rsbuild 配置
- 支持开发和生产环境的不同配置
- 集成 React 插件
- 集成 SVGR 插件
- 集成类型检查插件
- 集成 TanStack Router 插件

## 配置文件

- `base.ts`: 基础配置
- `development.ts`: 开发环境配置
- `production.ts`: 生产环境配置

## 使用方法

在项目的`rsbuild.config.ts`文件中导入此配置：

```ts
import { defineConfig } from "@rsbuild/core";
import baseConfig from "@rap/rsbuild-config/base";
import developmentConfig from "@rap/rsbuild-config/development";
import productionConfig from "@rap/rsbuild-config/production";

export default defineConfig({
  ...baseConfig,
  ...(process.env.NODE_ENV === "production"
    ? productionConfig
    : developmentConfig),
});
```

## 依赖

- @rsbuild/core
- @rsbuild/plugin-react
- @rsbuild/plugin-svgr
- @rsbuild/plugin-type-check
- @tanstack/router-plugin
- code-inspector-plugin
