# React Admin Pro

一个现代化的 React 管理系统脚手架，基于 pnpm workspace monorepo + turborepo 架构设计，支持多种构建工具和框架。

## 技术栈

- **前端框架**: React 19
- **构建工具**: Vite, Rsbuild, Turbopack
- **路由**: @tanstack/react-router (web-app), Next.js App Router (next-app)
- **状态管理**: @tanstack/react-query
- **UI 组件**: 基于 Radix UI 的自定义组件库
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint, Stylelint, Biome
- **包管理**: pnpm workspace + catalog + turborepo

## 特性

- 支持两种应用模式：基于 Vite/Rsbuild 的 SPA 应用和基于 Next.js 的 SSR 应用
- 统一的组件库和工具库，提高代码复用性
- 完善的 TypeScript 类型支持
- 现代化的构建工具链，支持快速开发和高效构建
- 模块化的代码组织方式，便于扩展和维护

## 项目结构

```bash
├── apps/                # 应用目录
│   ├── web-app/         # 基于Vite/Rsbuild的SPA应用
│   └── next-app/        # 基于Next.js的SSR应用
├── packages/            # 共享包目录
│   ├── components/      # 组件库
│   ├── hooks/           # React Hooks
│   ├── lib/             # 核心库
│   ├── styles/          # 样式库
│   ├── types/           # 类型定义
│   └── utils/           # 工具函数
├── config/              # 配置目录
│   ├── lint/            # 代码规范配置
│   ├── rsbuild/         # Rsbuild配置
│   ├── tailwindcss/     # Tailwind CSS配置
│   ├── tsconfig/        # TypeScript配置
│   └── vite/            # Vite配置
└── docs/                # 文档目录
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev


# 构建所有应用
pnpm build
```

## 许可证

ISC
