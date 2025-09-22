# @rap/tsconfig

React Admin Pro 的 TypeScript 配置包，提供了项目的 TypeScript 配置。

## 关键字

- TypeScript
- 配置预设
- 类型检查
- 开发工具
- 代码质量

## 特性

- 提供统一的 TypeScript 配置
- 支持不同环境的配置预设
- 严格的类型检查规则
- 优化的编译选项
- 与项目的其他工具链集成

## 配置文件

- `base.json`: 基础配置
- `react.json`: React 项目配置
- `node.json`: Node.js 项目配置
- `web.json`: Web 项目配置

## 使用方法

在项目的`tsconfig.json`文件中继承此配置：

```json
{
  "extends": "@rap/tsconfig/web.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

## 依赖

无外部依赖
