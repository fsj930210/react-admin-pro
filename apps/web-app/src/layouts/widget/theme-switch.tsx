import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { useTheme } from "@rap/components-ui/theme-provider";
import { Cpu, Leaf, Monitor, Moon, Sun } from "lucide-react";
import type { AppTheme } from "@/config/ui-preferences";
import { useUIPreferences } from "@/store/ui-preferences";

interface ThemeSwitchFeatureProps {
  className?: string;
}

const themeOptions: Array<{ value: AppTheme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "浅色主题", icon: Sun },
  { value: "dark", label: "深色主题", icon: Moon },
  { value: "tech-blue", label: "科技蓝", icon: Cpu },
  { value: "eco-green", label: "生态绿", icon: Leaf },
  { value: "system", label: "跟随系统", icon: Monitor },
];

export function ThemeSwitchFeature({ className }: ThemeSwitchFeatureProps) {
  const { setTheme } = useTheme();
  const preferences = useUIPreferences("preferences");
  const updatePreferences = useUIPreferences((state) => state.updatePreferences);

  const handleThemeChange = (theme: AppTheme) => {
    setTheme(theme);
    updatePreferences((draft) => {
      draft.appearance.theme = theme;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {themeOptions
          .filter((item) => preferences.appearance.availableThemes.includes(item.value))
          .map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.value} onClick={() => handleThemeChange(item.value)}>
                <Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
