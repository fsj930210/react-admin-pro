import { type ResizeDirection, useResize } from "@rap/hooks/use-resize";
import { Button } from "@rap/components-base/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@rap/components-base/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@rap/components-base/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";

export const Route = createFileRoute("/(layouts)/features/resize/")({
	component: ResizeFeaturePage,
});

// 可调整大小的Card组件
function ResizableCard() {
	const [resizable, setResizable] = useState(true);
	const [enableEdgeResize, setEnableEdgeResize] = useState(true);
	const { resizeRef, handleResize, isResizing, size, position, cursor } = useResize<HTMLDivElement>({
		minSize: { width: 200, height: 150 },
		maxSize: { width: 500, height: 400 },
		positionMode: 'translate',
		disabled: !resizable,
		enableEdgeResize: enableEdgeResize,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log('Card resized:', newSize, newPosition);
		},
	});

	const renderResizeHandles = () => (
		<>
			{!enableEdgeResize && (
				<div
					className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
					onMouseDown={(e) => handleResize("se")(e)}
					onTouchStart={(e) => handleResize("se")(e)}
					title="调整大小"
				/>
			)}
		</>
	);

	return (
		<Card
			ref={resizeRef}
			style={
				size && position
					? {
							width: `${size.width}px`,
							height: `${size.height}px`,
							transform: `translate(${position.x}px, ${position.y}px)`,
							willChange: "transform",
							cursor: enableEdgeResize ? cursor : (isResizing ? "grabbing" : "default"),
						}
					: { width: '300px', cursor: enableEdgeResize ? cursor : "default" }
			}
			className={`absolute shadow-xl ${isResizing ? "shadow-2xl" : ""}`}
		>
			<CardHeader className="select-none">
				<CardTitle>可调整大小的卡片</CardTitle>
				<CardDescription>
					{enableEdgeResize ? "拖拽边框和角落来调整卡片大小" : "拖拽右下角手柄来调整卡片大小"}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-4 relative">
				<p className="mb-2">这是一个可以调整大小的卡片组件。</p>
				<p className="mb-2 text-sm text-gray-600">
					当前尺寸: {size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : '300 × 150'}
				</p>
				<div className="flex gap-2 mb-2">
					<Button 
						onClick={() => setResizable((prev) => !prev)}
						variant="outline"
						size="sm"
					>
						{resizable ? "禁用" : "启用"}调整大小
					</Button>
					<Button 
						onClick={() => setEnableEdgeResize((prev) => !prev)}
						variant="outline"
						size="sm"
					>
						{enableEdgeResize ? "禁用" : "启用"}边和角resize
					</Button>
				</div>
				{resizable && renderResizeHandles()}
			</CardContent>
		</Card>
	);
}

// 可调整大小的Dialog组件
function ResizableDialog() {
	const [enableEdgeResize, setEnableEdgeResize] = useState(true);
	const { resizeRef, handleResize, size, position, cursor, bindEvent, removeEvent } = useResize<HTMLDivElement>({
		minSize: { width: 300, height: 200 },
		maxSize: { width: 800, height: 600 },
		positionMode: 'translate',
		enableEdgeResize: enableEdgeResize,
		edgeSize: 8,
		onResize: (newSize, newPosition) => {
			console.log('Dialog resized:', newSize, newPosition);
		},
	});

	const rafId = useRef(-1);
	const handleOpenChange = (open: boolean) => {
		if (open) {

			rafId.current = requestAnimationFrame(() => {
				bindEvent?.();
			});
		} else {
			removeEvent?.();
			if (rafId.current !== -1) {
				cancelAnimationFrame(rafId.current);
				rafId.current = -1;
			}
		}
	};

	let style: any = {};
	if (size) {
		if (size.width > 0 || size.height > 0) {
			style.width = size.width;
			style.height = size.height;
			style.cursor = cursor;
			style.maxWidth = 'none';
			style.maxHeight = 'none';
		}
		
	}
	if (position) {
		if (position.x > 0 || position.y > 0) {
			style.transform = `translate(${position.x}px, ${position.y}px)`
		}
	}
	return (
		<Dialog onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline">打开可调整大小对话框</Button>
			</DialogTrigger>
			<DialogContent
				ref={resizeRef}
				style={style}
				className="shadow-2xl"
			>
				<DialogHeader className="select-none">
					<DialogTitle>可调整大小的对话框</DialogTitle>
					<DialogDescription>
						{enableEdgeResize ? "拖拽边框和角落来调整对话框大小" : "拖拽右下角手柄来调整对话框大小"}
					</DialogDescription>
				</DialogHeader>
				<div className="py-4 relative">
					<p className="mb-2">这是一个可以调整大小的对话框组件。</p>
					<p className="mb-2 text-sm text-gray-600">
						当前尺寸: {size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : '默认尺寸'}
					</p>
					<p className="text-sm text-gray-500">
						最小尺寸: 300 × 200，最大尺寸: 800 × 600
					</p>
					
					<div className="mt-4">
						<Button 
							onClick={() => setEnableEdgeResize((prev) => !prev)}
							variant="outline"
							size="sm"
						>
							{enableEdgeResize ? "禁用" : "启用"}边和角resize
						</Button>
					</div>
					
					{!enableEdgeResize && (
						<div
							className="absolute bottom-4 right-4 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
							onMouseDown={(e) => handleResize("se")(e)}
							onTouchStart={(e) => handleResize("se")(e)}
							title="调整大小"
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ResizeFeaturePage() {
	// 位置模式状态
	const [positionMode, setPositionMode] = useState<'translate' | 'topLeft'>('translate');

	// 最小和最大尺寸限制
	const minSize = { width: 100, height: 100 };
	const maxSize = { width: 600, height: 400 };

	// 允许的缩放方向（8个方向）
	const resizableDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

	// 使用 resize hook
	const { resizeRef, handleResize, isResizing, size, position } = useResize<HTMLDivElement>({
		minSize,
		maxSize,
		directions: resizableDirections,
		positionMode,
		onResize: (newSize, newPosition) => {
			console.log(`Position Mode: ${positionMode}`, newSize, newPosition);
		},
	});

	return (
		<div className="p-6">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">Resize Feature Demo</h1>
				<p className="text-gray-600 mb-8">
					拖动边框和角落的手柄来调整元素大小。支持8个方向的缩放，并设置了最小和最大尺寸限制。
				</p>

				{/* 控制面板 */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">控制面板</h2>
					
					{/* 位置模式选择器 */}
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">位置模式</label>
						<div className="flex space-x-4">
							<button
								onClick={() => setPositionMode('translate')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									positionMode === 'translate'
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								Translate 模式
							</button>
							<button
								onClick={() => setPositionMode('topLeft')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									positionMode === 'topLeft'
										? 'bg-blue-500 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								TopLeft 模式
							</button>
						</div>
						<p className="mt-2 text-sm text-gray-600">
							{positionMode === 'translate' 
								? 'Translate 模式：使用 transform 属性进行位置变换，适合高性能动画'
								: 'TopLeft 模式：使用 top/left 属性进行定位，适合传统布局组件'
							}
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">宽度</label>
							<div className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
								{size && `${Math.round(size.width)}px`}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
							<div className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
								{size && `${Math.round(size.height)}px`}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">X 位置</label>
							<div className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
								{position && `${Math.round(position.x)}px`}
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Y 位置</label>
							<div className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">
								{position && `${Math.round(position.y)}px`}
							</div>
						</div>
					</div>

					<div className="mt-4 flex items-center space-x-2">
						<span className="text-sm font-medium text-gray-700">状态:</span>
						<span
							className={`px-2 py-1 rounded text-sm font-medium ${
								isResizing ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
							}`}
						>
							{isResizing ? "正在调整大小" : "空闲"}
						</span>
						<span className="text-sm text-gray-500 ml-4">
							当前模式: <span className="font-medium">{positionMode}</span>
						</span>
					</div>
				</div>

				{/* 限制信息 */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
					<h3 className="text-lg font-semibold text-blue-800 mb-2">尺寸限制</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="font-medium text-blue-700">最小尺寸:</span>
							<span className="ml-2 text-blue-600">100px × 100px</span>
						</div>
						<div>
							<span className="font-medium text-blue-700">最大尺寸:</span>
							<span className="ml-2 text-blue-600">600px × 400px</span>
						</div>
					</div>
				</div>

				{/* 可调整大小的元素容器 */}
				<div
					className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
					style={{ height: "500px" }}
				>
					<div className="absolute top-2 left-2 text-sm text-gray-500">
						拖动下方元素的边框和角落来调整大小
					</div>

					{/* 可调整大小的元素 */}
					<div
						ref={resizeRef}
						className={`absolute w-[100px] h-[100px] bg-linear-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg transition-shadow ${
							isResizing ? "shadow-2xl" : "hover:shadow-xl"
						}`}
						style={
							size && position
								? positionMode === 'translate' ?{
										width: `${size.width}px`,
										height: `${size.height}px`,
										transform: `translate(${position.x}px, ${position.y}px)`,
										willChange: "transform",
										cursor: isResizing ? "grabbing" : "default",
									} : {
										width: `${size.width}px`,
										height: `${size.height}px`,
										top: `${position.y}px`,
										left: `${position.x}px`,
										cursor: isResizing ? "grabbing" : "default",
									}
								: undefined
						}
					>
						{/* 元素内容 */}
						<div className="flex items-center justify-center h-full text-white">
							<div className="text-center">
								<div className="text-xs font-semibold mb-1">可调整大小</div>
								<div className="text-xs opacity-90">
									{size && `${Math.round(size.width)} × ${Math.round(size.height)}`}
								</div>
							</div>
						</div>

						{/* 8个方向的调整手柄 */}
						{/* 北边 (上) */}
						<div
							className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-n-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("n")(e)}
							onTouchStart={(e) => handleResize("n")(e)}
							title="向上拖动"
						/>

						{/* 南边 (下) */}
						<div
							className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-s-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("s")(e)}
							onTouchStart={(e) => handleResize("s")(e)}
							title="向下拖动"
						/>

						{/* 西边 (左) */}
						<div
							className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-w-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("w")(e)}
							onTouchStart={(e) => handleResize("w")(e)}
							title="向左拖动"
						/>

						{/* 东边 (右) */}
						<div
							className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-e-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("e")(e)}
							onTouchStart={(e) => handleResize("e")(e)}
							title="向右拖动"
						/>

						{/* 西北角 (左上) */}
						<div
							className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("nw")(e)}
							onTouchStart={(e) => handleResize("nw")(e)}
							title="向左上拖动"
						/>

						{/* 东北角 (右上) */}
						<div
							className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("ne")(e)}
							onTouchStart={(e) => handleResize("ne")(e)}
							title="向右上拖动"
						/>

						{/* 西南角 (左下) */}
						<div
							className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("sw")(e)}
							onTouchStart={(e) => handleResize("sw")(e)}
							title="向左下拖动"
						/>

						{/* 东南角 (右下) */}
						<div
							className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("se")(e)}
							onTouchStart={(e) => handleResize("se")(e)}
							title="向右下拖动"
						/>
					</div>
				</div>

				{/* Card 和 Dialog 示例 */}
				<div className="mt-8 bg-white rounded-lg shadow-md p-6 mb-8">
					<h3 className="text-lg font-semibold mb-4">Card 和 Dialog 示例</h3>
					<p className="text-sm text-gray-600 mb-6">
						以下示例展示了如何在真实的 UI 组件中使用 useResize hook
					</p>
					
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Card 示例 */}
						<div className="space-y-4">
							<h4 className="text-md font-medium text-gray-800">可调整大小的卡片</h4>
							<div className="relative h-[300px] border-2 border-dashed border-gray-200 rounded-lg p-4">
								<div className="absolute top-2 left-2 text-xs text-gray-500">
									卡片区域 - 拖拽右下角手柄调整大小
								</div>
								<ResizableCard />
							</div>
						</div>
						
						{/* Dialog 示例 */}
						<div className="space-y-4">
							<h4 className="text-md font-medium text-gray-800">可调整大小的对话框</h4>
							<div className="flex items-center justify-center h-[300px] border-2 border-dashed border-gray-200 rounded-lg">
								<ResizableDialog />
							</div>
						</div>
					</div>
				</div>

				{/* 使用说明 */}
				<div className="mt-8 bg-gray-100 rounded-lg p-6">
					<h3 className="text-lg font-semibold mb-3">使用说明</h3>
					<ul className="space-y-2 text-sm text-gray-700">
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span><strong>边和角resize：</strong>启用后可以直接拖拽元素的边框和角落来调整大小，就像Windows文件夹一样</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>拖动边框中央的圆形手柄可以单方向调整大小</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>拖动角落的圆形手柄可以同时调整宽度和高度</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>元素大小被限制在 100px × 100px 到 600px × 400px 之间</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>调整大小时元素位置会相应调整以保持自然的拖动体验</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								支持8个方向：上(n)、下(s)、左(w)、右(e)、左上(nw)、右上(ne)、左下(sw)、右下(se)
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>位置模式：</strong>支持 Translate 和 TopLeft 两种模式，可在控制面板切换
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>移动端支持：</strong>支持触摸事件，可在移动设备上使用
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>高内聚设计：</strong>translate 和 topLeft 模式各自封装为独立方法
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>组件集成：</strong>可以轻松集成到 Card、Dialog 等 UI 组件中
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>智能光标：</strong>当鼠标移动到可调整区域时，光标会自动变为相应的resize样式
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								<strong>Dialog支持：</strong>修复了Dialog组件的resize问题，支持动态DOM挂载
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
