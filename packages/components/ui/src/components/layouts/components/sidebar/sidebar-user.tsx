import { SidebarMenu, SidebarMenuItem } from "@rap/components-base/sidebar";
import { User } from "../user";

export function SidebarUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <User {...user} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
