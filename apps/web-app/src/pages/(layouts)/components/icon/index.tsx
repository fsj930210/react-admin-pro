import { Icon, IconView } from '@rap/components-ui/icon';
import { createFileRoute } from "@tanstack/react-router";
import logoImage from "@/assets/images/logo.svg";
import shadcnImage from "@/assets/images/shadcn.jpg";

export const Route = createFileRoute("/(layouts)/components/icon/")({
	component: IconComponentPage,
});

function IconComponentPage() {
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Icon 使用说明</h1>
			<p className="mb-4">Icon 组件用于显示图标，IconView组件用于展示图标集合</p>
			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-4">Icon 组件</h2>
				<p className="mb-4">基础图标组件，用于显示单个图标，支持 Iconify 图标，本地Iconify图标，自定义图标，图片图标。</p>
				<div className="flex flex-wrap gap-6 mb-6">
					<div className="flex flex-col items-center gap-2">
						<Icon icon="lucide:home" size={24} className="text-red-500" />
						<span className="text-sm">Iconify 图标</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Icon icon="rap-icon:github" size={24} />
						<span className="text-sm">本地Iconify图标</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Icon>
							<img src={logoImage} alt="logo" className="w-6 h-6" />
						</Icon>
						<span className="text-sm">自定义图标</span>
					</div>
					<div className="flex flex-col items-center gap-2">
						<Icon icon={shadcnImage} type="image" width={24} height={24} />
						<span className="text-sm">图片图标</span>
					</div>
				</div>
				<h3 className="text-lg font-medium mb-2">使用示例</h3>
				<pre className="bg-muted p-4 rounded-md text-sm mb-4">
					{`<Icon icon="lucide:home" size={24} /> // Iconify 图标`}
					<br />
					{`<Icon icon="rap-icon:github" size={24} /> // 本地Iconify图标`}
					<br />
					{
						`<Icon><img src={logoImage} alt="logo" className="w-6 h-6" /></Icon> // 自定义图标`
					}
					<br />
					{`<Icon icon={shadcnImage} type="image" width={24} height={24} /> // 图片图标`}
				</pre>
			</section>
			<section className="mb-8">
				<h2 className="text-xl font-semibold mb-4">IconView 组件</h2>
				<p className="mb-4">图标预览组件，用于展示不同图标集的图标。</p>
				<div className="border rounded-lg p-4 mb-4" style={{ height: '400px' }}>
					<IconView />
				</div>
				<h3 className="text-lg font-medium mb-2">使用默认图标集</h3>
				<p className="mb-4">IconView 组件默认内置了三个图标集：lucide、carbon 和 ri，无需额外导入即可使用：</p>
				<pre className="bg-muted p-4 rounded-md text-sm mb-4">
					{`<IconView />`}
				</pre>
				<h3 className="text-lg font-medium mb-2">添加自定义图标集</h3>
				<p className="mb-4">要在默认图标集的基础上添加新的图标集，需要先安装对应的 iconify-json 包，然后在 IconView 组件中使用 iconSets 属性：</p>
				<pre className="bg-muted p-4 rounded-md text-sm mb-2">
					{`# 安装 Ant Design 图标集
npm install @iconify-json/ant-design`}
					<br />
					{`import { icons as antDesignIcons } from '@iconify-json/ant-design';

<IconView 
	iconSets={[
		{
			prefix: "ant-design",
			icons: antDesignIcons
		}
	]}
/>`}
				</pre>
				<h3 className="text-lg font-medium mb-2">仅使用自定义图标集</h3>
				<p className="mb-4">如果只想使用自定义图标集，不包含默认图标集，可以设置 disableDefaultIconSets 属性：</p>
				<pre className="bg-muted p-4 rounded-md text-sm">
					{`import { icons as antDesignIcons } from '@iconify-json/ant-design';

<IconView 
	disableDefaultIconSets={true}
	iconSets={[
		{
			prefix: "ant-design",
			icons: antDesignIcons
		}
	]}
/>`}
				</pre>
			</section>
		</div>
	);
}
