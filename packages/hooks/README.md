# @rap/hooks

React Admin Pro 的自定义 React Hooks 集合，提供了常用的功能性 Hooks。

## 关键字

- React
- Hooks
- 功能性
- 可复用
- 工具

## 特性

- 提供常用的功能性 Hooks
- 简化复杂状态管理和副作用处理
- 完善的 TypeScript 类型支持
- 零依赖设计，轻量级

## Hooks 列表

- `useMobile`: 检测当前设备是否为移动设备
- 更多 Hooks 正在开发中...

## 使用方法

```tsx
import { useMobile } from "@rap/hooks/use-mobile";

export default function MyComponent() {
  const isMobile = useMobile();

  return <div>{isMobile ? "移动设备" : "桌面设备"}</div>;
}
```

## 依赖

- React 19+
