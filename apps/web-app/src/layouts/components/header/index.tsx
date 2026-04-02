import { cn } from "@rap/utils";
import type React from "react";
import { memo } from "react";
import { AppLogo } from "@/components/app/logo";
import { CollapseSidebarFeature } from "../../widget/collapse-sidebar";
import { FullscreenFeature } from "../../widget/fullscreen";
import { I18nFeature } from "../../widget/i18n";
import { ReloadFeature } from "../../widget/reload";
import { ThemeSwitchFeature } from "../../widget/theme-switch";
import { Breadcrumb } from "../breadcrumb";
import { AppSearchFeature } from "./features/app-search";
import { NotifyFeature } from "./features/notify";
import { UserCenterFeature } from "./features/user-center";

type AppHeaderFeatures =
	| "logo"
	| "reload"
	| "user-center"
	| "theme-switch"
	| "fullscreen"
	| "notify"
	| "app-search"
	| "breadcrumb"
	| "collapse-sidebar"
	| "i18n";

interface AppHeaderProps {
	leftFeatures?: AppHeaderFeatures[];
	rightFeatures?: AppHeaderFeatures[];
	leftRender?: React.ReactNode;
	rightRender?: React.ReactNode;
	className?: string;
}

// biome-ignore lint:suspicious/noExplicitAny
const featureComponents: Record<AppHeaderFeatures, React.FC<any>> = {
	logo: AppLogo,
	reload: ReloadFeature,
	i18n: I18nFeature,
	fullscreen: FullscreenFeature,
	notify: NotifyFeature,
	breadcrumb: Breadcrumb,
	"app-search": AppSearchFeature,
	"collapse-sidebar": CollapseSidebarFeature,
	"user-center": UserCenterFeature,
	"theme-switch": ThemeSwitchFeature,
};

export const AppHeader = memo(
	({
		leftFeatures = ["breadcrumb"],
		rightFeatures = [
			"app-search",
			"theme-switch",
			"i18n",
			"fullscreen",
			"reload",
			"notify",
			"user-center",
		],
		leftRender,
		rightRender,
		className,
	}: AppHeaderProps) => {
		const renderFeature = (feature: AppHeaderFeatures, index: number) => {
			const Component = featureComponents[feature];
			return Component ? <Component key={`${feature}-${index}`} /> : null;
		};

		return (
			<header
				className={cn(
					"flex items-center justify-between h-11 w-full px-2 bg-app-header",
					className,
				)}
			>
				<div className="flex items-center gap-2">
					{leftRender ?? leftFeatures.map((feature, index) => renderFeature(feature, index))}
				</div>

				<div className="flex items-center gap-2">
					{rightRender ?? rightFeatures.map((feature, index) => renderFeature(feature, index))}
				</div>
			</header>
		);
	},
);
