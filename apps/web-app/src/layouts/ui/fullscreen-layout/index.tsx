import { SidebarInset } from "@rap/components-base/sidebar/index"
import { Content } from "./shared/content"

const FullScreenLayout = () => {
  return (
    <SidebarInset>
      <Content />
    </SidebarInset>
  )
}

export default FullScreenLayout