import { useResize, type ResizeDirection } from "@rap/hooks/use-resize";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/(layouts)/features/resize/")({
	component: ResizeFeaturePage,
});

function ResizeFeaturePage() {


	// 最小和最大尺寸限制
	const minSize = { width: 100, height: 100 };
	const maxSize = { width: 600, height: 400 };

	// 允许的缩放方向（8个方向）
	const resizableDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

	// 使用 resize hook
	const { ref, handleResize, isResizing, size, position } = useResize({
		minSize,
		maxSize,
		directions: resizableDirections,
		onResize: (newSize, newPosition) => {
			console.log(newSize, newPosition)
		}
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
						ref={ref as any}
						className={`absolute bg-linear-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg transition-shadow ${
							isResizing ? "shadow-2xl" : "hover:shadow-xl"
						}`}
						style={size && position ?{
							width: `${size.width}px`,
							height: `${size.height}px`,
							transform: `translate(${position.x}px, ${position.y}px)`,
							willChange: 'transform',
							cursor: isResizing ? "grabbing" : "default",
						}: undefined}
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
							title="向上拖动"
						/>

						{/* 南边 (下) */}
						<div
							className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-s-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("s")(e)}
							title="向下拖动"
						/>

						{/* 西边 (左) */}
						<div
							className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-w-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("w")(e)}
							title="向左拖动"
						/>

						{/* 东边 (右) */}
						<div
							className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-e-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("e")(e)}
							title="向右拖动"
						/>

						{/* 西北角 (左上) */}
						<div
							className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("nw")(e)}
							title="向左上拖动"
						/>

						{/* 东北角 (右上) */}
						<div
							className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("ne")(e)}
							title="向右上拖动"
						/>

						{/* 西南角 (左下) */}
						<div
							className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("sw")(e)}
							title="向左下拖动"
						/>

						{/* 东南角 (右下) */}
						<div
							className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:scale-125 transition-transform"
							onMouseDown={(e) => handleResize("se")(e)}
							title="向右下拖动"
						/>
					</div>
				</div>

				{/* 使用说明 */}
				<div className="mt-8 bg-gray-100 rounded-lg p-6">
					<h3 className="text-lg font-semibold mb-3">使用说明</h3>
					<ul className="space-y-2 text-sm text-gray-700">
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
					</ul>
				</div>
			</div>
		</div>
	);
}
