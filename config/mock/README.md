# @rap/vite-config

React Admin Pro 的 Vite 配置包，提供了项目的 Vite 构建配置。

## 关键字

- Vite
- 构建工具
- 性能优化
- 开发体验
- 配置预设

## 特性

- 提供统一的 Vite 配置
- 支持开发和生产环境的不同配置
- 集成 React SWC 插件
- 集成 SVGR 插件
- 集成 TanStack Router 插件
- 集成代码压缩和分析工具

## 配置内容

- 开发服务器配置
- 构建优化配置
- 插件配置
- 路径别名配置

## 使用方法

在项目的`vite.config.ts`文件中导入此配置：

```ts
import { defineConfig } from "vite";
import { createViteConfig } from "@rap/vite-config";

export default defineConfig(createViteConfig());
```

## 依赖

- vite
- @vitejs/plugin-react-swc
- @tanstack/router-plugin
- vite-plugin-svgr
- vite-plugin-compression
- rollup-plugin-visualizer
- code-inspector-plugin
