import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@rap/components-ui/card";
import { Label } from "@rap/components-ui/label";
import { MinimalTiptapEditor } from "@rap/components-ui/minimal-tiptap";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@rap/components-ui/table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/components/rich-text/")({
	component: RouteComponent,
});

function RouteComponent() {
	const defaultContent = `
<h1>富文本编辑器演示</h1>
<p>这是一个功能完整的富文本编辑器，支持以下功能：</p>
<h2>文本样式</h2>
<p>支持多种标题级别（H1-H6）和段落格式，可以通过快捷键快速切换。</p>
<h2>文本格式化</h2>
<p>支持<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>行内代码</code>等格式。</p>
<h2>列表</h2>
<ol>
  <li>有序列表项 1</li>
  <li>有序列表项 2</li>
</ol>
<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
</ul>
<h2>插入元素</h2>
<blockquote>这是一个引用块，可以用来引用其他内容。</blockquote>
<pre><code>这是代码块，可以用来展示代码片段。</code></pre>
<p>尝试编辑这个文档，体验所有功能！</p>
  `.trim();

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">富文本组件使用指南</h1>
				<p className="text-muted-foreground">
					基于 Tiptap 的轻量级富文本编辑器，支持多种格式和功能
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>基本使用</CardTitle>
					<CardDescription>最基础的富文本编辑器使用示例</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="min-h-[300px]">
							<MinimalTiptapEditor
								value={defaultContent}
								onChange={(content) => console.log("Content changed:", content)}
								placeholder="开始输入内容..."
								className="min-h-[300px]"
							/>
						</div>
						<div className="space-y-2">
							<Label>基本使用代码</Label>
							<pre className="rounded-md bg-muted p-4 overflow-x-auto text-sm">
								<code>{`<MinimalTiptapEditor
  value={defaultContent}
  onChange={(content) => console.log('Content changed:', content)}
  placeholder="开始输入内容..."
  className="min-h-[300px]"
/>`}</code>
							</pre>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>输出格式参数</CardTitle>
					<CardDescription>通过 output 参数指定不同的输出格式</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableCaption>支持的输出格式</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>参数值</TableHead>
								<TableHead>输出格式</TableHead>
								<TableHead>返回类型</TableHead>
								<TableHead>描述</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>
									<code>"html"</code>
								</TableCell>
								<TableCell>HTML</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>标准的 HTML 格式，包含所有标签和属性</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>"json"</code>
								</TableCell>
								<TableCell>JSON</TableCell>
								<TableCell>
									<code>object</code>
								</TableCell>
								<TableCell>JSON 格式的编辑器内容，适合程序化处理</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>"text"</code>
								</TableCell>
								<TableCell>纯文本</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>去除所有格式的纯文本内容</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>"markdown"</code>
								</TableCell>
								<TableCell>Markdown</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>Markdown 格式，支持表格和任务列表</TableCell>
							</TableRow>
						</TableBody>
					</Table>

					<div className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label>使用示例</Label>
							<pre className="rounded-md bg-muted p-4 overflow-x-auto text-sm">
								<code>{`// HTML 格式
<MinimalTiptapEditor
  output="html"
  onChange={(htmlContent) => {
    console.log('HTML content:', htmlContent);
  }}
/>

// JSON 格式
<MinimalTiptapEditor
  output="json"
  onChange={(jsonContent) => {
    console.log('JSON content:', jsonContent);
  }}
/>

// 纯文本格式
<MinimalTiptapEditor
  output="text"
  onChange={(textContent) => {
    console.log('Text content:', textContent);
  }}
/>

// Markdown 格式
<MinimalTiptapEditor
  output="markdown"
  onChange={(markdownContent) => {
    console.log('Markdown content:', markdownContent);
  }}
/>`}</code>
							</pre>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>其他参数</CardTitle>
					<CardDescription>常用的配置参数说明</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableCaption>常用配置参数</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead>参数</TableHead>
								<TableHead>类型</TableHead>
								<TableHead>默认值</TableHead>
								<TableHead>描述</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>
									<code>value</code>
								</TableCell>
								<TableCell>
									<code>Content</code>
								</TableCell>
								<TableCell>
									<code>undefined</code>
								</TableCell>
								<TableCell>编辑器的初始内容</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>onChange</code>
								</TableCell>
								<TableCell>
									<code>{`(content: Content) => void`}</code>
								</TableCell>
								<TableCell>
									<code>undefined</code>
								</TableCell>
								<TableCell>内容变化时的回调函数</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>placeholder</code>
								</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>
									<code>""</code>
								</TableCell>
								<TableCell>编辑器为空时显示的占位文本</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>className</code>
								</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>
									<code>undefined</code>
								</TableCell>
								<TableCell>编辑器容器的 CSS 类名</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>editorContentClassName</code>
								</TableCell>
								<TableCell>
									<code>string</code>
								</TableCell>
								<TableCell>
									<code>undefined</code>
								</TableCell>
								<TableCell>编辑器内容区域的 CSS 类名</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>throttleDelay</code>
								</TableCell>
								<TableCell>
									<code>number</code>
								</TableCell>
								<TableCell>
									<code>0</code>
								</TableCell>
								<TableCell>onChange 回调的节流延迟（毫秒）</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<code>uploader</code>
								</TableCell>
								<TableCell>
									<code>{`(file: File) => Promise<string>`}</code>
								</TableCell>
								<TableCell>
									<code>undefined</code>
								</TableCell>
								<TableCell>自定义图片上传函数</TableCell>
							</TableRow>
						</TableBody>
					</Table>

					<div className="mt-6 space-y-4">
						<div className="space-y-2">
							<Label>自定义上传函数示例</Label>
							<pre className="rounded-md bg-muted p-4 overflow-x-auto text-sm">
								<code>{`const customUploader = async (file: File): Promise<string> => {
  // 实现你的上传逻辑
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.url; // 返回上传后的图片 URL
};

<MinimalTiptapEditor
  uploader={customUploader}
  onChange={(content) => console.log('Content changed:', content)}
/>`}</code>
							</pre>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>功能说明</CardTitle>
					<CardDescription>编辑器支持的所有功能</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<h3 className="font-semibold">文本样式</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 标题（H1-H6）</li>
								<li>• 段落</li>
								<li>• 快捷键支持（Ctrl+Alt+1-6）</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">文本格式化</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 粗体（Ctrl+B）</li>
								<li>• 斜体（Ctrl+I）</li>
								<li>• 下划线（Ctrl+U）</li>
								<li>• 删除线（Ctrl+Shift+S）</li>
								<li>• 行内代码（Ctrl+E）</li>
								<li>• 清除格式（Ctrl+\）</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">颜色和样式</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 多种预设颜色</li>
								<li>• 深色模式支持</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">列表</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 有序列表（Ctrl+Shift+7）</li>
								<li>• 无序列表（Ctrl+Shift+8）</li>
								<li>• 任务列表（Markdown 模式）</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">插入元素</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 代码块（Ctrl+Alt+C）</li>
								<li>• 引用（Ctrl+Shift+B）</li>
								<li>• 分割线（Ctrl+Alt+-）</li>
								<li>• 链接</li>
								<li>• 图片（支持拖拽和粘贴）</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">高级功能</h3>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Markdown 支持</li>
								<li>• 表格（Markdown 模式）</li>
								<li>• 图片上传</li>
								<li>• 拖拽文件</li>
								<li>• 剪贴板粘贴</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
