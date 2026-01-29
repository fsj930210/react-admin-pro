import React from "react";
import { Logo } from "@rap/components-ui/logo";
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

type AppHeaderFeatures = 'logo' | 'reloadCurrentTab' | 'userCenter' | 'themeSwitch' | 'fullscreen' | 'notify' | 'globalSearch' | 'breadcrumb' | 'collapseSidebar' | 'i18n';

interface LayoutHeaderProps {
	leftFeatures?: AppHeaderFeatures[];
	rightFeatures?: AppHeaderFeatures[];
	leftRender?: React.ReactNode;
	rightRender?: React.ReactNode;
}

const featureComponents: Record<AppHeaderFeatures, React.FC<any>> = {
	logo: Logo,
	reloadCurrentTab: ReloadCurrentTabFeature,
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
	rightFeatures = ['globalSearch', 'themeSwitch', 'i18n', 'fullscreen', 'reloadCurrentTab', 'notify', 'userCenter'],
	leftRender,
	rightRender
}: LayoutHeaderProps) {
	

	const renderFeature = (feature: AppHeaderFeatures, index: number) => {
		const Component = featureComponents[feature];
		return Component ? <Component key={`${feature}-${index}`} /> : null;
	};

	return (
		<header className="flex items-center justify-between h-11 w-full px-2">
			<div className="flex items-center">
				{leftRender ?? leftFeatures.map((feature, index) => renderFeature(feature, index))}
			</div>

			<div className="flex items-center">
				{rightRender ?? rightFeatures.map((feature, index) => renderFeature(feature, index))}
			</div>
		</header>
	)
}