import { SidebarMenu, SidebarMenuItem } from "@rap/components-base/resizable-sidebar";
import { User } from "../user";


export function SidebarUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <User />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
