import { Content } from "./shared/content"
import { Header } from "./shared/header"
import AppLogo from "@/components/app/AppLogo"

const HorizontalLayout = () => {
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <Header
        Logo={<AppLogo />}
        desktopItems={
          <nav className="flex items-center space-x-4">
            {/* 水平菜单将在这里渲染 */}
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              仪表盘
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              功能
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              组件
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              概览
            </a>
          </nav>
        }
        mobileItems={() => (
          <nav className="flex flex-col space-y-2 py-2">
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              仪表盘
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              功能
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              组件
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
              概览
            </a>
          </nav>
        )}
      />
      <Content>
        <div className="h-full">
          {/* 页面内容将通过路由渲染到这里 */}
        </div>
      </Content>
    </div>
  )
}

export default HorizontalLayout