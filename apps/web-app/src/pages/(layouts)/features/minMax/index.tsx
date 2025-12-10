import { createFileRoute } from "@tanstack/react-router";
// import { BasicWindow } from "./-components/BasicWindow";
// import { CustomMaxSizeWindow } from "./-components/CustomMaxSizeWindow";
// import { CircleWindow } from "./-components/CircleWindow";
// import { TopLeftWindow } from "./-components/TopLeftWindow";

export const Route = createFileRoute("/(layouts)/features/minMax/")({
  component: MinMaxFeaturePage,
});

function MinMaxFeaturePage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MinMax Feature Demo</h1>
        <p className="text-gray-600 mb-8">
          演示窗口的最小化、最大化和关闭功能。支持自定义最小化样式、位置和最大尺寸，并可拖动窗口。
        </p>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">窗口控制面板</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* <BasicWindow />
            <CustomMaxSizeWindow />
            <CircleWindow />
            <TopLeftWindow /> */}
          </div>
        </div>

        {/* 功能说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">功能特性</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <li>• 支持最小化到指定位置（四个角落）</li>
            <li>• 支持最大化到全屏或自定义尺寸</li>
            <li>• 最小化后可恢复到原始大小和位置</li>
            <li>• 支持圆形或长条形最小化样式</li>
            <li>• 智能状态切换（最大化时最小化会先退出最大化）</li>
            <li>• 支持关闭功能和回调</li>
            <li>• 支持拖动窗口（正常模式下）</li>
            <li>• 边界吸附和屏幕范围限制</li>
          </ul>
        </div>

        {/* 窗口容器 */}
        <div className="relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300" style={{ height: '600px' }}>
          <div className="absolute top-2 left-2 text-sm text-gray-500">
            拖动窗口标题栏或内容区域来移动窗口，测试最小化、最大化和关闭功能
          </div>

          {/* 实际显示的窗口 */}
          {/* <BasicWindow />
          <CustomMaxSizeWindow />
          <CircleWindow />
          <TopLeftWindow /> */}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>点击最小化按钮（-）将窗口缩小到指定位置</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>点击最大化按钮（□）将窗口放大到全屏或自定义尺寸</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>最小化的窗口可以通过点击再次恢复到原始大小</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>支持圆形和长条形两种最小化样式</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>点击关闭按钮（×）可以关闭窗口</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>状态切换是智能的，会自动处理冲突状态</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>新增：</strong>拖动窗口标题栏或内容区域可以移动窗口位置</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>新增：</strong>窗口限制在屏幕范围内，支持边界吸附</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>新增：</strong>最大化和最小化状态下禁用拖动功能</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
