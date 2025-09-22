# @rap/types

React Admin Pro 的类型定义包，提供了项目中使用的通用 TypeScript 类型。

## 关键字

- TypeScript
- 类型定义
- 类型工具
- 类型安全
- 开发工具

## 特性

- 提供通用的 TypeScript 类型定义
- 类型工具函数
- 提高代码的类型安全性
- 简化复杂类型的定义

## 类型工具

- `type-utils`: 类型工具函数集合
- 更多类型工具正在开发中...

## 使用方法

```tsx
import { DeepPartial } from "@rap/types/type-utils";

interface User {
  id: string;
  name: string;
  profile: {
    avatar: string;
    bio: string;
  };
}

// 部分用户数据
const partialUser: DeepPartial<User> = {
  name: "John",
  profile: {
    avatar: "avatar.png",
  },
};
```

## 依赖

- TypeScript
