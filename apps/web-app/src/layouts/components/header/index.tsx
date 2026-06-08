import { cn } from "@rap/utils";
import { useResponsive } from "@rap/hooks/use-media-query";
import { Button } from "@rap/components-ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { MoreHorizontal } from "lucide-react";
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

interface HeaderFeatureMeta {
  priority: number;
  group: "navigation" | "primary" | "secondary" | "context" | "brand";
  collapse: "keep" | "more" | "hide" | "icon-only";
}

const featureMeta: Record<AppHeaderFeatures, HeaderFeatureMeta> = {
  logo: { priority: 5, group: "brand", collapse: "icon-only" },
  breadcrumb: { priority: 4, group: "context", collapse: "hide" },
  "collapse-sidebar": { priority: 0, group: "navigation", collapse: "keep" },
  "app-search": { priority: 1, group: "primary", collapse: "keep" },
  "user-center": { priority: 1, group: "primary", collapse: "keep" },
  notify: { priority: 2, group: "primary", collapse: "more" },
  "theme-switch": { priority: 3, group: "secondary", collapse: "more" },
  i18n: { priority: 3, group: "secondary", collapse: "more" },
  fullscreen: { priority: 3, group: "secondary", collapse: "hide" },
  reload: { priority: 3, group: "secondary", collapse: "more" },
  "ui-preferences": { priority: 3, group: "secondary", collapse: "more" },
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
    const { isMobile, isTablet } = useResponsive();
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

    const renderResponsiveLeftFeature = (feature: AppHeaderFeatures, index: number) => {
      if (feature === "breadcrumb" && (isMobile || isTablet)) return null;
      const Component = featureComponents[feature];
      if (!Component) return null;
      if (feature === "logo") {
        return <Component key={`${feature}-${index}`} showTitle={!isMobile && !isTablet} />;
      }
      return <Component key={`${feature}-${index}`} />;
    };

    const visibleRightFeatures = resolvedRightFeatures.filter((feature) => {
      const meta = featureMeta[feature];
      if (!isMobile && !isTablet) return true;
      return meta.collapse === "keep";
    });

    const overflowRightFeatures = resolvedRightFeatures
      .filter((feature) => {
        const meta = featureMeta[feature];
        if (!isMobile && !isTablet) return false;
        return meta.collapse === "more" || (isMobile && feature === "notify");
      })
      .sort((a, b) => featureMeta[a].priority - featureMeta[b].priority);

    return (
      <header
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 overflow-hidden px-2 bg-app-header",
          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {leftRender ??
            leftFeatures.map((feature, index) => renderResponsiveLeftFeature(feature, index))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {rightRender ??
            visibleRightFeatures.map((feature, index) => renderFeature(feature, index))}
          {!rightRender && overflowRightFeatures.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="More actions">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-2">
                <div className="grid grid-cols-4 gap-1">
                  {overflowRightFeatures.map((feature, index) => renderFeature(feature, index))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>
    );
  }
);
