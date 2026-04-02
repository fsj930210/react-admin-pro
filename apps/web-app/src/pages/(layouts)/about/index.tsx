import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";

export const Route = createFileRoute("/(layouts)/about/")({
	component: AboutPage,
});

const projectMarkdown = `
# React Admin Pro

一个现代化的 React 管理系统脚手架，基于 pnpm workspace monorepo + turborepo 架构设计，支持多种构建工具和框架。

## 技术栈

### 核心技术
- **前端框架**: React 19
- **构建工具**: Vite, Rsbuild, Turbopack
- **路由**: @tanstack/react-router (web-app), Next.js App Router (next-app)
- **状态管理**: @tanstack/react-query
- **UI 组件**: 基于 Radix UI 的自定义组件库
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint, Stylelint, Biome
- **包管理**: pnpm workspace + catalog + turborepo

### 主要依赖
- **表单处理**: react-hook-form + zod
- **拖拽功能**: @dnd-kit/core
- **图标**: @iconify/react, lucide-react
- **动画**: framer-motion
- **图表**: echarts, echarts-for-react
- **富文本编辑**: @tiptap/react
- **通知**: sonner
- **工具函数**: lodash-es, ahooks

## 实现的功能

### 布局系统
- **垂直布局**: 经典的侧边栏 + 内容区域布局
- **水平布局**: 顶部导航 + 内容区域布局
- **双列布局**: 双侧边栏 + 内容区域布局
- **混合布局**: 支持多种布局组合方式
- **全屏布局**: 全屏展示模式
- **侧边布局**: 独立侧边栏布局

### 核心功能
- **主题切换**: 支持浅色/深色主题切换，可隔离控制区域
- **标签页系统**: 
  - Chrome 风格标签页
  - VSCode 风格标签页
  - 经典标签页
  - 支持拖拽排序、右键菜单
- **面包屑导航**: 
  - 胶囊式面包屑
  - 经典面包屑
  - 平行四边形面包屑
  - 丝带式面包屑
- **菜单系统**:
  - 支持嵌套菜单
  - 菜单搜索（支持拼音搜索）
  - 菜单项高亮
  - 菜单徽章
- **Keep-Alive**: 页面缓存功能，保持页面状态

### 组件库
#### 基础组件 (@rap/components-base)
- Accordion, Alert Dialog, Avatar, Badge
- Button, Calendar, Card, Carousel
- Checkbox, Combobox, Command
- Dialog, Dropdown Menu, Drawer
- Form, Input, Label, Select
- Navigation Menu, Popover, Progress
- Radio Group, Slider, Switch
- Tabs, Toast, Tooltip
- 以及更多...

#### 高级组件 (@rap/components-ui)
- **富文本编辑器**: 基于 Tiptap 的 Markdown 编辑器
- **树形组件**: 支持异步加载、勾选、拖拽、搜索
- **图标组件**: 图标选择器、图标查看器
- **Keep-Alive**: 页面缓存组件
- **主题提供者**: 主题切换管理
- **加载组件**: Spinner, Skeleton

### 业务功能
- **用户认证**: 登录页面（支持多种登录方式）
- **数据看板**: 统计卡片、图表展示
- **国际化**: i18n 支持
- **全屏模式**: 全屏切换功能
- **页面刷新**: 快速刷新当前页面
- **用户中心**: 用户信息管理
- **通知系统**: 消息通知功能

### 开发工具
- **React Query DevTools**: 数据查询调试工具
- **Router DevTools**: 路由调试工具
- **Mock Service Worker**: API 模拟
- **代码规范**: ESLint, Stylelint, Biome
- **Git 钩子**: Commitlint, Husky

## 项目目录结构

\`\`\`bash
react-admin-pro/
├── apps/                          # 应用目录
│   ├── web-app/                   # 基于 Vite/Rsbuild 的 SPA 应用
│   │   ├── public/                # 静态资源
│   │   ├── src/
│   │   │   ├── assets/            # 资源文件（图标、图片）
│   │   │   ├── components/        # 项目通用组件
│   │   │   ├── config/            # 配置文件
│   │   │   ├── layouts/           # 布局组件
│   │   │   │   ├── components/    # 布局子组件
│   │   │   │   ├── context/       # 布局上下文
│   │   │   │   ├── hooks/         # 布局 Hooks
│   │   │   │   ├── service/       # 布局服务
│   │   │   │   ├── ui/            # 布局 UI
│   │   │   │   └── widget/        # 布局小部件
│   │   │   ├── mock/              # Mock 数据
│   │   │   ├── pages/             # 页面路由
│   │   │   │   ├── (layouts)/     # 布局路由组
│   │   │   │   │   ├── about/     # 关于页面
│   │   │   │   │   ├── dashboard/ # 仪表板
│   │   │   │   │   ├── features/  # 功能展示
│   │   │   │   │   ├── overview/  # 概览页面
│   │   │   │   │   └── nested-menu/ # 嵌套菜单
│   │   │   │   └── login/         # 登录页面
│   │   │   ├── service/           # API 服务
│   │   │   ├── store/             # 状态管理
│   │   │   ├── styles/            # 样式文件
│   │   │   └── App.tsx            # 应用入口
│   │   └── package.json
│   └── next-app/                  # 基于 Next.js 的 SSR 应用（预留）
├── packages/                      # 共享包目录
│   ├── components/                # 组件库
│   │   ├── base/                  # 基础组件库
│   │   │   └── src/
│   │   │       └── components/    # 基础组件
│   │   └── ui/                    # 高级组件库
│   │       └── src/
│   │           └── components/    # 高级组件
│   ├── hooks/                     # React Hooks
│   ├── lib/                       # 核心库
│   ├── styles/                    # 样式库
│   ├── types/                     # 类型定义
│   └── utils/                     # 工具函数
├── config/                        # 配置目录
│   ├── lint/                      # 代码规范配置
│   │   ├── biome/                 # Biome 配置
│   │   ├── eslint/                # ESLint 配置
│   │   ├── stylelint/             # Stylelint 配置
│   │   └── commitlint/            # Commitlint 配置
│   ├── rsbuild/                   # Rsbuild 配置
│   ├── tailwindcss/               # Tailwind CSS 配置
│   ├── tsconfig/                  # TypeScript 配置
│   └── vite/                      # Vite 配置
├── docs/                          # 文档目录
├── .husky/                        # Git 钩子
├── package.json                   # 根 package.json
├── pnpm-workspace.yaml            # pnpm workspace 配置
├── turbo.json                     # Turborepo 配置
└── README.md                      # 项目说明
\`\`\`

## 快速迭代

### 开发环境
\`\`\`bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 启动 web-app（使用 Rsbuild）
pnpm dev:web

# 启动 web-app（使用 Vite）
pnpm dev:web-vite
\`\`\`

### 构建部署
\`\`\`bash
# 构建所有应用
pnpm build

# 构建 web-app
pnpm build:web

# 预览构建结果
pnpm preview
\`\`\`

### 代码规范
\`\`\`bash
# 运行所有代码检查
pnpm lint

# 运行 Biome 检查
pnpm lint:biome

# 运行 ESLint 检查
pnpm lint:eslint

# 运行 Stylelint 检查
pnpm lint:stylelint
\`\`\`

### 快速迭代特性

1. **Monorepo 架构**: 使用 pnpm workspace + Turborepo 管理多个应用和共享包
2. **并行构建**: Turborepo 支持并行构建，显著提升构建速度
3. **增量构建**: 只构建发生变化的包，节省时间
4. **共享配置**: 统一的构建配置、代码规范配置
5. **类型安全**: 完善的 TypeScript 类型支持
6. **代码规范**: 自动化的代码格式化和检查
7. **Git 钩子**: Commitlint + Husky 确保提交信息规范
8. **热更新**: Vite/Rsbuild 提供快速的热更新体验
9. **开发工具**: 集成 React Query DevTools 和 Router DevTools
10. **Mock 数据**: MSW 支持 API 模拟，便于前后端并行开发

### 开发建议

1. **组件开发**: 在 \`packages/components\` 中开发共享组件
2. **页面开发**: 在 \`apps/web-app/src/pages\` 中开发页面
3. **样式开发**: 使用 Tailwind CSS，遵循设计规范
4. **状态管理**: 使用 @tanstack/react-query 管理服务端状态
5. **路由管理**: 使用 @tanstack/react-router 的文件路由系统
6. **代码规范**: 提交前运行 \`pnpm lint\` 确保代码质量
7. **类型检查**: TypeScript 提供完善的类型检查
8. **测试**: 编写单元测试和集成测试

## 特性总结

- ✅ 支持两种应用模式：基于 Vite/Rsbuild 的 SPA 应用和基于 Next.js 的 SSR 应用
- ✅ 统一的组件库和工具库，提高代码复用性
- ✅ 完善的 TypeScript 类型支持
- ✅ 现代化的构建工具链，支持快速开发和高效构建
- ✅ 模块化的代码组织方式，便于扩展和维护
- ✅ 多种布局系统，满足不同业务场景
- ✅ 丰富的组件库，覆盖常见业务需求
- ✅ 完善的开发工具和调试支持
- ✅ 自动化的代码规范检查和格式化
- ✅ 高效的构建和部署流程

## 许可证

ISC
`;

function AboutPage() {
	return (
		<div className="max-w-none p-6">
			<div className="prose prose-slate dark:prose-invert">
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					rehypePlugins={[rehypeHighlight, rehypeRaw]}
					components={{
						code: ({ className, children, ...props }) => {
							const match = /language-(\w+)/.exec(className ?? '');
							const isInline = !className?.includes('language-');
							return !isInline && match ? (
								<pre className="bg-card text-card-foreground p-4 rounded-md overflow-x-auto border border-border">
									<code className={className} {...props}>
										{children}
									</code>
								</pre>
							) : (
								<code className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-sm" {...props}>
									{children}
								</code>
							);
						},
						pre: ({ children }) => (
							<div className="rounded-md overflow-hidden">
								{children}
							</div>
						),
						blockquote: ({ children }) => (
							<blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
								{children}
							</blockquote>
						),
						table: ({ children }) => (
							<table className="min-w-full border-collapse border border-border">
								{children}
							</table>
						),
						th: ({ children }) => (
							<th className="border border-border px-4 py-2 bg-muted">
								{children}
							</th>
						),
						td: ({ children }) => (
							<td className="border border-border px-4 py-2">
								{children}
							</td>
						),
						ul: ({ children }) => (
							<ul className="list-disc pl-5 space-y-1">
								{children}
							</ul>
						),
						ol: ({ children }) => (
							<ol className="list-decimal pl-5 space-y-1">
								{children}
							</ol>
						),
						h1: ({ children }) => (
							<h1 className="text-3xl font-bold mb-4">
								{children}
							</h1>
						),
						h2: ({ children }) => (
							<h2 className="text-2xl font-bold mb-3 mt-8">
								{children}
							</h2>
						),
						h3: ({ children }) => (
							<h3 className="text-xl font-bold mb-2 mt-6">
								{children}
							</h3>
						),
						h4: ({ children }) => (
							<h4 className="text-lg font-bold mb-1 mt-4">
								{children}
							</h4>
						),
						p: ({ children }) => (
							<p className="mb-4">
								{children}
							</p>
						),
						a: ({ children, href }) => (
							<a
								href={href}
								className="text-primary hover:underline"
								rel="noopener noreferrer"
								target="_blank"
							>
								{children}
							</a>
						),
					}}
				>
					{projectMarkdown}
				</ReactMarkdown>
			</div>
		</div>
	);
}
