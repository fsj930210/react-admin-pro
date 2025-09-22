# React Admin Pro - Web App

基于 Vite 和 Rsbuild 的现代化 React 管理系统 SPA 应用。

## 技术栈

- **前端框架**: React 19
- **构建工具**: Rsbuild, Vite
- **路由**: @tanstack/react-router
- **状态管理**: @tanstack/react-query
- **UI 组件**: @rap/components-base, @rap/components-ui
- **表单**: react-hook-form + zod
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint, Stylelint, Biome

## 特性

- 支持 Rsbuild 和 Vite 两种构建方式
- 基于@tanstack/react-router 的文件路由系统
- 内置 React Query 数据获取和缓存方案
- 高性能组件渲染和优化
- 完善的开发工具支持，包括 React Query DevTools 和 Router DevTools

## 快速开始

```bash
# 安装依赖
pnpm install

# 使用Rsbuild启动开发服务器
pnpm dev

# 使用Vite启动开发服务器
pnpm dev:vite

# 构建应用
pnpm build

# 预览构建后的应用
pnpm preview
```

## 目录结构

src/
├── components/ # 项目通用组件
├── hooks/ # 自定义 Hooks
├── pages/ # 页面路由
├── services/ # API 服务
├── stores/ # 状态管理
├── styles/ # 样式文件
└── utils/ # 工具函数
