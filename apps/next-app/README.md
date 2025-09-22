# React Admin Pro - Next App

基于 Next.js 的现代化 React 管理系统 SSR 应用。

## 技术栈

- **前端框架**: React 19
- **SSR 框架**: Next.js 15
- **构建工具**: Turbopack
- **状态管理**: @tanstack/react-query
- **表单**: react-hook-form + zod
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint, Stylelint, Biome

## 特性

- 基于 Next.js App Router 的文件路由系统
- 服务端渲染(SSR)和静态站点生成(SSG)支持
- 内置 React Query 数据获取和缓存方案
- 高性能组件渲染和优化
- 完善的开发工具支持

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建应用
pnpm build

# 启动生产服务器
pnpm start
```

## 目录结构

app/
├── (auth)/ # 认证相关页面
├── (layout)/ # 通用布局及页面
├── login/ # 登录页
├── components/ # 项目通用组件
├── hooks/ # 自定义 Hooks
├── lib/ # 工具库
└── styles/ # 样式文件
