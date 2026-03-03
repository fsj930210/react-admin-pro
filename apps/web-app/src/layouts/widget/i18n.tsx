import { Button } from "@rap/components-base/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu";
import { Globe } from "lucide-react";
import React from "react";

interface I18nFeatureProps {
	className?: string;
}

export function I18nFeature({ className }: I18nFeatureProps) {
	// 示例语言列表，实际项目中可以从i18n配置中获取
	const languages = [
		{ code: "zh-CN", name: "简体中文" },
		{ code: "en-US", name: "English" },
	];

	// 模拟当前语言
	const [currentLanguage, setCurrentLanguage] = React.useState("zh-CN");

	const handleLanguageChange = (code: string) => {
		setCurrentLanguage(code);
		// 实际项目中这里应该调用i18n的语言切换方法
		console.log("切换语言到:", code);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className={className}>
					<Globe className="h-4 w-4" />
					<span className="sr-only">语言切换</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center">
				{languages.map((language) => (
					<DropdownMenuItem
						key={language.code}
						onClick={() => handleLanguageChange(language.code)}
						className={currentLanguage === language.code ? "bg-accent" : ""}
					>
						{language.name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
