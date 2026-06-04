import { MarkdownRenderer } from "@rap/components-pro/markdown";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/about/")({
  component: AboutPage,
});

const projectMarkdown = `
# React Admin Pro

一个面向中后台、组件库文档、低代码和运维平台的 React Monorepo 模板。

## 当前定位

| 模块 | 说明 |
| --- | --- |
| web-app | 主应用壳，承载布局、权限、菜单、主题和公共配置 |
| components-ui | 基础 UI 组件，尽量保持轻量和稳定 |
| components-pro | 业务级组件，例如图标、树、表格、Markdown 渲染器 |
| config | Vite、Rsbuild、Tailwind、Lint 等共享配置 |

## Markdown 能力

- 默认支持 GFM：表格、任务列表、删除线等语法。
- 默认不渲染原始 HTML，后端 HTML 需要显式开启。
- 代码高亮按需加载，不会进入所有页面的首屏包。
- 代码块内置复制按钮，后续文档站可以直接复用。

## 代码示例

\`\`\`tsx
import { MarkdownRenderer } from "@rap/components-pro/markdown";

export function DocsBlock({ content }: { content: string }) {
  return (
    <MarkdownRenderer
      value={content}
      enableCodeHighlight
    />
  );
}
\`\`\`

## 后续方向

文档站建议基于 React + MDX 自研一层 docs app：既能独立访问，也能作为微前端接入主应用。MarkdownRenderer 负责普通 Markdown 内容，MDX 负责组件文档里的代码预览和交互 demo。
`;

function AboutPage() {
  return (
    <div className="max-w-none p-6">
      <MarkdownRenderer value={projectMarkdown} />
    </div>
  );
}
