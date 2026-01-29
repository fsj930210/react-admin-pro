import { Content } from "./shared/content"
import { LayoutHeader } from "./shared/header"
import { useLayoutSidebar } from "./shared/sidebar/sidebar-context"
import { Logo } from "@rap/components-ui/logo"
import { HorizontalMenu } from "./shared/horizontal-menu"
import { APP_BASE_PATH } from "@/config"
import { SidebarInset } from "@rap/components-base/resizable-sidebar/index"

const HorizontalLayout = () => {
  const { menus, handleMenuItemClick, selectedMenu } = useLayoutSidebar()

  // 过滤出一级菜单
  const mainMenus = menus.filter(menu => !menu.parentId)

  return (
    <SidebarInset className="overflow-hidden min-w-0">
      <LayoutHeader
        rightFeatures={['globalSearch', 'themeSwitch', 'i18n', 'fullscreen', 'reloadCurrentTab', 'notify', 'userCenter']}
        leftRender={
          <div className="flex items-center w-full">
            <div className="mr-6">
              <Logo url={`${APP_BASE_PATH}/logo.svg`} title="React Admin Pro" />
            </div>
            <HorizontalMenu 
              className="flex-1"
              menus={mainMenus}
              selectedMenu={selectedMenu}
              onMenuItemClick={handleMenuItemClick}
            />
          </div>
        }
      />
      <Content />
    </SidebarInset>
  )
}

export default HorizontalLayout