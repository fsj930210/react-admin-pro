# @rap/biome-config

React Admin Pro 的 Biome 配置包，提供了项目的代码格式化和检查规则。

## 关键字

- Biome
- 代码格式化
- 代码检查
- 开发工具
- 代码质量

## 特性

- 提供统一的 Biome 配置
- 支持 JavaScript、TypeScript、JSX、TSX 和 JSON 文件
- 自定义的代码格式化规则
- 自定义的代码检查规则
- 与项目的其他工具链集成

## 配置文件

- `biome.json`: Biome 主配置文件

## 使用方法

在项目的`biome.json`文件中继承此配置：

```json
{
  "extends": ["@rap/biome-config/biome.json"],
  "files": {
    "includes": ["src/**"]
  }
}
```

## 依赖

- @biomejs/biome
