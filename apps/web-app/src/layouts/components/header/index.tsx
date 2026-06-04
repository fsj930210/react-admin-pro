import { cn } from "@rap/utils";
import type React from "react";
import { memo } from "react";
import { AppLogo } from "@/components/app/logo";
import { CollapseSidebarFeature } from "../../widget/collapse-sidebar";
import { FullscreenFeature } from "../../widget/fullscreen";
import { I18nFeature } from "../../widget/i18n";
import { ReloadFeature } from "../../widget/reload";
import { ThemeSwitchFeature } from "../../widget/theme-switch";
import { UIPreferencesFeature } from "../../widget/ui-preferences";
import { Breadcrumb } from "../breadcrumb";
import { AppSearchFeature } from "./features/app-search";
import { NotifyFeature } from "./features/notify";
import { UserCenterFeature } from "./features/user-center";
import { useUIPreferences } from "@/store/ui-preferences";

export type AppHeaderFeatures =
  | "logo"
  | "reload"
  | "user-center"
  | "theme-switch"
  | "fullscreen"
  | "notify"
  | "app-search"
  | "breadcrumb"
  | "collapse-sidebar"
  | "i18n"
  | "ui-preferences";

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
  "ui-preferences": UIPreferencesFeature,
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
    const preferences = useUIPreferences("preferences");
    const rightFeatureSet =
      preferences.templatePreview.enabled && !rightFeatures.includes("ui-preferences")
        ? [...rightFeatures, "ui-preferences" as const]
        : rightFeatures;
    const resolvedRightFeatures = rightFeatureSet.filter((feature) => {
      if (feature === "i18n") return preferences.i18n.showSwitcher;
      return true;
    });
    const renderFeature = (feature: AppHeaderFeatures, index: number) => {
      const Component = featureComponents[feature];
      return Component ? <Component key={`${feature}-${index}`} /> : null;
    };

    return (
      <header
        className={cn(
          "flex items-center justify-between h-11 w-full px-2 bg-app-header",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {leftRender ?? leftFeatures.map((feature, index) => renderFeature(feature, index))}
        </div>

        <div className="flex items-center gap-2">
          {rightRender ??
            resolvedRightFeatures.map((feature, index) => renderFeature(feature, index))}
        </div>
      </header>
    );
  }
);
