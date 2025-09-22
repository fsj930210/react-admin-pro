# @rap/utils

React Admin Pro 的工具函数库，提供了一系列通用的 JavaScript/TypeScript 工具函数。

## 关键字

- 工具函数
- 实用程序
- 辅助函数
- 类型安全
- 通用工具

## 特性

- 提供常用的工具函数
- 类型安全的实用程序
- 轻量级设计，按需导入
- 完善的 TypeScript 类型支持

## 工具函数列表

- 字符串处理
- 数组操作
- 对象处理
- 日期格式化
- CSS 类名合并
- 更多工具函数...

## 使用方法

```tsx
import { cn } from "@rap/utils";

export default function MyComponent({ className }) {
  return (
    <div className={cn("base-class", className, { "conditional-class": true })}>
      合并CSS类名
    </div>
  );
}
```

## 依赖

- clsx
- tailwind-merge
