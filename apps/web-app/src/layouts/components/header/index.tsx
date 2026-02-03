import React from "react";
import {
  ReloadCurrentTabFeature,
  UserCenterFeature,
  ThemeSwitchFeature,
  FullscreenFeature,
  NotifyFeature,
  GlobalSearchFeature,
  CollapseSidebarFeature,
  I18nFeature,
} from "./features";
import { Breadcrumb } from "../breadcrumb";
import { AppLogo } from "@/components/app/logo";
import { cn } from "@rap/utils";

type AppHeaderFeatures = 'logo' | 'reload' | 'userCenter' | 'themeSwitch' | 'fullscreen' | 'notify' | 'globalSearch' | 'breadcrumb' | 'collapseSidebar' | 'i18n';

interface LayoutHeaderProps {
	leftFeatures?: AppHeaderFeatures[];
	rightFeatures?: AppHeaderFeatures[];
	leftRender?: React.ReactNode;
	rightRender?: React.ReactNode;
	className?: string;
}

const featureComponents: Record<AppHeaderFeatures, React.FC<any>> = {
	logo: AppLogo,
	reload: ReloadCurrentTabFeature,
	userCenter: UserCenterFeature,
	themeSwitch: ThemeSwitchFeature,
	fullscreen: FullscreenFeature,
	notify: NotifyFeature,
	globalSearch: GlobalSearchFeature,
	breadcrumb: Breadcrumb,
	collapseSidebar: CollapseSidebarFeature,
	i18n: I18nFeature,
};

export function AppHeader({
	leftFeatures = ['breadcrumb'],
	rightFeatures = ['globalSearch', 'themeSwitch', 'i18n', 'fullscreen', 'reload', 'notify', 'userCenter'],
	leftRender,
	rightRender,
	className,
}: LayoutHeaderProps) {


	const renderFeature = (feature: AppHeaderFeatures, index: number) => {
		const Component = featureComponents[feature];
		return Component ? <Component key={`${feature}-${index}`} /> : null;
	};

	return (
		<header className={cn("flex items-center justify-between h-11 w-full px-2", className)}>
			<div className="flex items-center gap-2">
				{leftRender ?? leftFeatures.map((feature, index) => renderFeature(feature, index))}
			</div>

			<div className="flex items-center gap-2">
				{rightRender ?? rightFeatures.map((feature, index) => renderFeature(feature, index))}
			</div>
		</header>
	)
}