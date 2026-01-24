import { Sidebar } from "./sidebar"
import { Content } from "./shared/content"
import { Header } from "./shared/header"
import { Logo } from "@rap/components-ui/logo"
import { SidebarInset } from "@rap/components-base/resizable-sidebar"
import { APP_BASE_PATH } from "@/config"

const VerticalLayout = () => {
  return (
    <>
      <Sidebar logo={`${APP_BASE_PATH}/logo.svg`} />
      <SidebarInset className="overflow-hidden min-w-0">
        <Header
          Logo={<Logo />}
          desktopItems={null}
          mobileItems={() => null}
        />
        <Content />
      </SidebarInset>
    </>
  )
}

export default VerticalLayout