import { SidebarMenu, SidebarMenuItem } from "@rap/components-base/sidebar";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@rap/components-base/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu";
import { SidebarMenuButton } from "@rap/components-base/sidebar";
import { useIsMobile } from "@rap/hooks/use-mobile";
import { cn } from "@rap/utils";
import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
} from "lucide-react";
import { useUserSelector } from "@/store/user";
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
	const { userInfo } = useUserSelector(['userInfo']);
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
						Upgrade to Pro
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard />
						Billing
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Bell />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => logoutMutation.mutate()}
					disabled={logoutMutation.isPending}
				>
					<LogOut />
					{logoutMutation.isPending ? 'Logging out...' : 'Log out'}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
