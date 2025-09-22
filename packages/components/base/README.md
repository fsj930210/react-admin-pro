# @rap/components-base

React Admin Pro 的基础组件库，提供了一套基于 Radix UI 的可访问性和可定制性强的 UI 组件。

## 关键字

- React
- UI 组件
- Radix UI
- 可访问性
- 主题定制

## 特性

- 基于 Radix UI 的无样式组件，提供最大的样式自由度
- 完全支持键盘导航和屏幕阅读器
- 支持深色模式和主题定制
- 完善的 TypeScript 类型支持
- 与 Tailwind CSS 无缝集成

## 组件列表

包含但不限于以下组件：

- Accordion
- Alert Dialog
- Avatar
- Button
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Navigation Menu
- Popover
- Progress
- Radio Group
- Select
- Slider
- Switch
- Tabs
- Toast
- Tooltip

## 使用方法

```tsx
import { Button } from "@rap/components-base/button";

export default function MyComponent() {
  return <Button variant="default">Click me</Button>;
}
```

## 依赖

- React 19+
- Radix UI 组件
- class-variance-authority
- tailwind-merge
