# @rap/tailwindcss-config

React Admin Pro 的 Tailwind CSS 配置包，提供了项目的样式配置。

## 关键字

- Tailwind CSS
- 样式配置
- 主题定制
- 响应式设计
- PostCSS

## 特性

- 提供统一的 Tailwind CSS 配置
- 自定义主题和颜色系统
- 扩展的实用工具类
- 集成动画库
- PostCSS 配置

## 配置文件

- `tailwindcss.css`: Tailwind CSS 基础样式
- `postcss.config.ts`: PostCSS 配置

## 使用方法

在项目的`postcss.config.ts`文件中导入此配置：

```ts
import postcssConfig from "@rap/tailwindcss-config/postcss";

export default postcssConfig;
```

在 CSS 文件中导入 Tailwind CSS：

```css
@import "@rap/tailwindcss-config/tailwindcss.css";
```

## 依赖

- tailwindcss
- @tailwindcss/postcss
- tw-animate-css
