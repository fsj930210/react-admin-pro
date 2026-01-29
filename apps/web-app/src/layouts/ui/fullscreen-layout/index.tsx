import { SidebarInset } from "@rap/components-base/resizable-sidebar/index"
import { Content } from "./shared/content"

const FullScreenLayout = () => {
  return (
    <SidebarInset>
      <Content />
    </SidebarInset>
  )
}

export default FullScreenLayout