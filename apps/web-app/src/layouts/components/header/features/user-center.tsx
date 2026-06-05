import { Avatar, AvatarFallback, AvatarImage } from "@rap/components-ui/avatar";
import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { useTranslation } from "@rap/i18n";
import { BadgeCheck, CreditCard, LogOut, Settings, User } from "lucide-react";

interface UserCenterFeatureProps {
  className?: string;
}

export function UserCenterFeature({ className }: UserCenterFeatureProps) {
  const { t } = useTranslation("webApp");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${className}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{t("header.userName")}</p>
            <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>{t("header.profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("header.settings")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t("header.billing")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BadgeCheck className="mr-2 h-4 w-4" />
            <span>{t("header.certification")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("header.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
