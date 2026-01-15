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
import { SidebarMenuButton } from "@rap/components-base/resizable-sidebar";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { logout as logoutApi } from "@/service/auth";
import { toast } from "sonner";
import { useUserSelector } from "@/store/user";

export interface UserProps {
  name: string;
  email: string;
  avatar: string;
  dropdownMenuTriggerClassName?: string;
}

export function User({
  name,
  email,
  avatar,
  dropdownMenuTriggerClassName,
}: UserProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUserInfo } = useUserSelector();

  // 登出 mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await logoutApi().promise;
      return res;
    },
    onSuccess: () => {
      // 清除 localStorage 中的 token
      localStorage.removeItem('token');
      // 清空用户信息 store
      setUserInfo({
        id: '',
        username: '',
        gender: 0,
        avatar: '',
        phone: '',
        email: '',
      });
      toast.success('Logout success');
      // 导航到登录页
      router.navigate({ to: '/login', replace: true });
      // 使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const isLogoutLoading = logoutMutation.isPending;
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
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs">{email}</span>
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
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs">{email}</span>
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
          onClick={() => logout()}
          disabled={isLogoutLoading}
        >
          <LogOut />
          {isLogoutLoading ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
