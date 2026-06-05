import { Badge } from "@rap/components-ui/badge";
import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { useTranslation } from "@rap/i18n";
import { Bell } from "lucide-react";

interface NotifyFeatureProps {
  className?: string;
}

export function NotifyFeature({ className }: NotifyFeatureProps) {
  const { t } = useTranslation("webApp");
  const notifications = [
    {
      id: 1,
      title: t("header.notificationItems.newMessageTitle"),
      content: t("header.notificationItems.newMessageContent"),
      time: t("header.notificationItems.twoMinutesAgo"),
    },
    {
      id: 2,
      title: t("header.notificationItems.systemTitle"),
      content: t("header.notificationItems.systemContent"),
      time: t("header.notificationItems.oneHourAgo"),
    },
    {
      id: 3,
      title: t("header.notificationItems.todoTitle"),
      content: t("header.notificationItems.todoContent"),
      time: t("header.notificationItems.yesterday"),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-4 w-4" />
          <Badge
            variant="destructive"
            className="absolute -top-1 right-0 h-4 min-w-4 rounded-full px-1 py-0 flex-center text-[10px] z-10"
          >
            {notifications.length > 99 ? "99+" : notifications.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold mb-2">
            {t("header.notifications")} ({notifications.length})
          </h3>
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-2 mb-2 hover:bg-accent cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.content}</span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
