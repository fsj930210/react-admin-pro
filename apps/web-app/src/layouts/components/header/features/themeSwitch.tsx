import { Button } from "@rap/components-base/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu";
import { useTheme } from "@rap/components-ui/theme-provider";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitchFeatureProps {
	className?: string;
}

export function ThemeSwitchFeature({ className }: ThemeSwitchFeatureProps) {
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className={className}>
					<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">切换主题</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>浅色主题</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>深色主题</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>系统默认</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
