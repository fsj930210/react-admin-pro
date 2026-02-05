import { SidebarMenu, SidebarMenuItem, SidebarMenuSkeleton } from "@rap/components-base/sidebar";

export function SidebarSkeleton() {
  return (
    <SidebarMenu>
			{Array.from({ length: 5 }).map((_, index) => (
				// eslint-disable-next-line @eslint-react/no-array-index-key
				<SidebarMenuItem key={index}>
					<SidebarMenuSkeleton showIcon />
				</SidebarMenuItem>
			))}
		</SidebarMenu>
  );
}