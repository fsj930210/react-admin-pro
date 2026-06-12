# React Admin Pro

一个现代化的 React 管理系统脚手架，基于 pnpm workspace monorepo + turborepo 架构设计，支持多种构建工具和框架。

## 技术栈

- **前端框架**: React 19
- **构建工具**: Vite, Rsbuild, Turbopack
- **路由**: @tanstack/react-router (web-app)
- **状态管理**: @tanstack/react-query
- **UI 组件**: 基于 Radix UI 的自定义组件库
- **样式方案**: Tailwind CSS
- **代码规范**: ESLint, Stylelint, Biome
- **包管理**: pnpm workspace + catalog + turborepo

## 特性

- 基于 Vite/Rsbuild 的 SPA 应用
- 统一的组件库和工具库，提高代码复用性
- 完善的 TypeScript 类型支持
- 现代化的构建工具链，支持快速开发和高效构建
- 模块化的代码组织方式，便于扩展和维护

## 项目结构

```bash
├── apps/                # 应用目录
│   ├── web-app/         # 基于Vite/Rsbuild的SPA应用
├── packages/            # 共享包目录
│   ├── components/      # 组件库
│   ├── hooks/           # React Hooks
│   ├── lib/             # 核心库
│   ├── styles/          # 样式库
│   ├── types/           # 类型定义
│   └── utils/           # 工具函数
├── config/              # 配置目录
│   ├── lint/            # 代码规范配置
│   ├── rsbuild/         # Rsbuild配置
│   ├── tailwindcss/     # Tailwind CSS配置
│   ├── tsconfig/        # TypeScript配置
│   └── vite/            # Vite配置
└── docs/                # 文档目录
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 使用vite作为构建工具
pnpm dev:web-vite

# 构建所有应用
pnpm build
```

## 许可证

MIT License

## Date Picker

`@rap/components-pro/date-picker` exposes:

- `DatePicker`
- `RangePicker`
- `DateTimePicker`

All public values use `dayjs.Dayjs`. Native `Date` is not exposed in the component API.

### Import

```tsx
import dayjs from "dayjs";
import { DatePicker, RangePicker, DateTimePicker } from "@rap/components-pro/date-picker";
```

### DatePicker

```tsx
function Demo() {
  const [value, setValue] = useState<dayjs.Dayjs | null>(dayjs());

  return (
    <DatePicker
      value={value}
      onChange={setValue}
      format="YYYY-MM-DD"
      placeholder="Select date"
      allowClear
    />
  );
}
```

Supported `mode` values:

- `date`
- `week`
- `month`
- `quarter`
- `year`

```tsx
<DatePicker mode="month" format="YYYY-MM" />
<DatePicker mode="year" format="YYYY" />
<DatePicker mode="quarter" format="YYYY-[Q]Q" />
<DatePicker mode="week" format="GGGG-[W]WW" />
```

### RangePicker

```tsx
function Demo() {
  const [value, setValue] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([
    dayjs().subtract(6, "day"),
    dayjs(),
  ]);

  return (
    <RangePicker
      value={value}
      onChange={setValue}
      format="YYYY-MM-DD"
      placeholder={["Start date", "End date"]}
      presets={[
        { label: "Last 7 Days", value: () => [dayjs().subtract(6, "day"), dayjs()] },
      ]}
    />
  );
}
```

### DateTimePicker

```tsx
function Demo() {
  const [value, setValue] = useState<dayjs.Dayjs | null>(dayjs());

  return (
    <DateTimePicker
      value={value}
      onChange={setValue}
      format="YYYY-MM-DD HH:mm:ss"
      showTime
    />
  );
}
```

`DateTimePicker` reuses the existing `TimePicker` and supports `disabledTime`:

```tsx
<DateTimePicker
  format="YYYY-MM-DD HH:mm:ss"
  showTime
  disabledTime={(current) => ({
    disabledHours: () => (current.isSame(dayjs(), "day") ? [0, 1, 2, 3, 4, 5] : []),
    disabledMinutes: (hour) => (hour === 12 ? [15, 16, 17, 18] : []),
    disabledSeconds: (hour, minute) => (hour === 12 && minute === 30 ? [10, 11, 12] : []),
  })}
/>
```

### Common Props

- `value`
- `defaultValue`
- `onChange`
- `format`
- `placeholder`
- `allowClear`
- `disabled`
- `readOnly`
- `prefix`
- `suffix`
- `icon`
- `disabledDate`
- `presets`
- `footer`
- `renderCell`
- `renderPanel`

### Demo Route

```txt
/rap-web-app/components/date-picker
```
