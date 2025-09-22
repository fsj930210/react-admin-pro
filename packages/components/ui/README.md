# @rap/components-ui

React Admin Pro 的高级 UI 组件库，基于@rap/components-base 构建，提供了更多业务场景下的复合组件。

## 关键字

- React
- UI 组件
- 业务组件
- 复合组件
- 高级组件

## 特性

- 基于@rap/components-base 构建的高级组件
- 针对常见业务场景优化
- 提供布局组件、导航组件等复合组件
- 完善的 TypeScript 类型支持
- 与 Tailwind CSS 无缝集成

## 组件列表

包含但不限于以下组件：

- 布局组件 (Layouts)
  - Dashboard Layout
  - Auth Layout
  - Settings Layout
- 标签页组件 (Tabs)
  - 自定义标签页
  - 卡片标签页
- 加载组件 (Loading)
  - Spinner
  - Skeleton

## 使用方法

```tsx
import { DashboardLayout } from "@rap/components-ui/layouts";

export default function Dashboard() {
  return <DashboardLayout>{/* 内容 */}</DashboardLayout>;
}
```

## 依赖

- React 19+
- @rap/components-base
- @rap/hooks
- @rap/utils
- class-variance-authority
- lucide-react
