import { Avatar, AvatarFallback, AvatarImage } from "@rap/components-ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@rap/components-ui/sidebar";
import { useIsMobile } from "@rap/hooks/use-mobile";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useLayout } from "@/layouts/context/layout-context";
import { useAuth } from "@/pages/login/-hooks/useAuth";

export function SidebarUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <User />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface UserProps {
  dropdownMenuTriggerClassName?: string;
}

export function User({ dropdownMenuTriggerClassName }: UserProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("webApp");
  const { userInfo } = useLayout();
  const { logoutMutation } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={cn(
            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer",
            dropdownMenuTriggerClassName
          )}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userInfo?.avatar} alt={userInfo?.username} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{userInfo?.username}</span>
            <span className="truncate text-xs">{userInfo?.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={userInfo?.avatar} alt={userInfo?.username} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{userInfo?.username}</span>
              <span className="truncate text-xs">{userInfo?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            {t("header.upgradeToPro")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            {t("header.account")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            {t("header.billing")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            {t("header.notifications")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut />
          {logoutMutation.isPending ? t("header.loggingOut") : t("header.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
