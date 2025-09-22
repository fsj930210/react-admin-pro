# @rap/lib

React Admin Pro 的核心工具库，提供了一系列用于 React 组件开发的工具函数和实用程序。

## 关键字

- React
- 工具库
- 实用程序
- 辅助函数
- 类型安全

## 特性

- 提供 React 组件开发中常用的工具函数
- 类型安全的实用程序
- 轻量级设计，按需导入
- 完善的 TypeScript 类型支持

## 工具函数列表

- `composeRefs`: 组合多个 React refs
- 更多工具函数正在开发中...

## 使用方法

```tsx
import { composeRefs } from "@rap/lib/compose-refs";
import { useRef } from "react";

export default function MyComponent() {
  const ref1 = useRef(null);
  const ref2 = useRef(null);

  return <div ref={composeRefs(ref1, ref2)}>组合多个refs</div>;
}
```

## 依赖

- React 19+
- clsx
- tailwind-merge
