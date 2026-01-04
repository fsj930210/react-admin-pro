
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-base/collapsible";
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@rap/components-base/resizable-sidebar";
import { ChevronRight, } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useNavigate } from "@tanstack/react-router";

export function SidebarMain() {
  const { menus, selectedMenu, setSelectedMenu } = useSidebar();
	const  navigate  = useNavigate();
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {menus.map((item) => (
          <Collapsible
            key={item.id}
            asChild
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
									isActive={selectedMenu?.id === item.id}
									tooltip={item.title} 
									onClick={() => {
										setSelectedMenu(item);
										if (item.url) {
											navigate({to: item.url});
										}	
									}}
									className="cursor-pointer"
								>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
									{(item?.children?.length ?? 0) > 0 && (
                  	<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									)}
                </SidebarMenuButton>
              </CollapsibleTrigger>
							{
								(item.children?.length ?? 0) > 0 && (
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.children?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.id}>
													<SidebarMenuSubButton asChild>
														<a onClick={() => {
															setSelectedMenu(subItem);
															if (subItem.url) {
																navigate({to: subItem.url});
															}	
														}}>
															<span>{subItem.title}</span>
														</a>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								)
							}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
