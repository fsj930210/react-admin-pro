# @rap/styles

React Admin Pro 的样式库，提供了全局样式和实用工具类。

## 关键字

- CSS
- Tailwind CSS
- 样式工具
- 主题
- 实用工具类

## 特性

- 提供全局样式和 CSS 重置
- 基于 Tailwind CSS 的实用工具类
- 支持深色模式和主题定制
- 与组件库无缝集成

## 样式文件

- `globals.css`: 全局样式和 CSS 重置
- `utility.css`: 实用工具类

## 使用方法

```tsx
// 在应用入口文件中导入全局样式
import "@rap/styles/globals.css";

// 在组件中使用实用工具类
import "@rap/styles/utility.css";

export default function MyComponent() {
  return <div className="flex-center">居中内容</div>;
}
```

## 依赖

- Tailwind CSS
- tw-animate-css
