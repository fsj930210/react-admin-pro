import { cn } from "@rap/utils";
import type { MenuBadge, MenuBadgeColor } from "@/layouts/hooks/useMenuService";


interface SidebarBadgeProps {
  badge?: MenuBadge;
  className?: string;
}

const colorMap: Record<MenuBadgeColor, string> = {
  default: 'bg-gray-500',
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  destructive: 'bg-red-500',
  custom: '',
};

const textColorMap: Record<MenuBadgeColor, string> = {
  default: 'text-gray-600 bg-gray-100',
  primary: 'text-blue-600 bg-blue-100',
  success: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  destructive: 'text-red-600 bg-red-100',
  custom: '',
};

export function SidebarBadge({ badge, className }: SidebarBadgeProps) {
  if (!badge) return null;

  const { type = 'badge', text, color = 'default', customColor } = badge;

  if (type === 'dot') {
    const bgColor = customColor ?? (color === 'custom' ? '' : colorMap[color]);
    return (
      <span className={cn("ml-auto size-1.5 shrink-0 relative rounded-full", className)}>
        <span
          className={cn(
            "absolute size-full inline-flex rounded-full animate-ping opacity-75",
            bgColor
          )}
          style={customColor ? { backgroundColor: customColor } : undefined}
        />
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            bgColor
          )}
          style={customColor ? { backgroundColor: customColor } : undefined}
        />
      </span>
    );
  }

  if (type === 'text') {
    const textColorClass = customColor || color === 'custom' ? '' : textColorMap[color];
    return (
      <span
        className={cn(
          "ml-auto px-1.5 py-0.5 text-xs font-medium rounded",
          textColorClass,
          customColor && "text-white",
          className
        )}
        style={customColor ? { backgroundColor: customColor } : undefined}
      >
        {text}
      </span>
    );
  }

  const bgColor = customColor ?? colorMap[color];
  return (
    <span
      className={cn(
        "ml-auto px-1.5 py-0.5 text-xs font-medium text-white rounded-full",
        bgColor,
        className
      )}
      style={customColor ? { backgroundColor: customColor } : undefined}
    >
      {text}
    </span>
  );
}
