import { Sidebar } from "./shared/sidebar"
import { Content } from "./shared/content"
import { Header } from "./shared/header"
import AppLogo from "@/components/app/AppLogo"

const SideLayout = () => {
  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          Logo={<AppLogo />}
          desktopItems={null}
          mobileItems={() => null}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar logo="/logo.svg" />
          <Content>
            <div className="h-full">
              {/* 页面内容将通过路由渲染到这里 */}
            </div>
          </Content>
        </div>
      </div>
    </div>
  )
}

export default SideLayout