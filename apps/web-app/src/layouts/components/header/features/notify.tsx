import { Bell } from "lucide-react";
import { Button } from "@rap/components-base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu";
import { Badge } from "@rap/components-base/badge";

interface NotifyFeatureProps {
  className?: string;
}

export function NotifyFeature({ className }: NotifyFeatureProps) {
  const notifications = [
    { id: 1, title: "新消息", content: "您有一条新消息", time: '2分钟前' },
    { id: 2, title: '系统通知', content: '系统维护通知', time: '1小时前' },
    { id: 3, title: '待办事项', content: '您的待办事项提醒', time: '昨天' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-4 w-4" />
          <Badge variant="destructive" className="absolute -top-1 right-0 h-4 min-w-4 rounded-full px-1 py-0 flex-center text-[10px] z-10">
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold mb-2">通知 ({notifications.length})</h3>
          {notifications.map(notification => (
            <DropdownMenuItem key={notification.id} className="p-2 mb-2 hover:bg-accent cursor-pointer">
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