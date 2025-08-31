/** biome-ignore-all lint:a11y/noSvgWithoutTitle */

import { cn } from "@rap/utils";
import { X } from "lucide-react";
import type { LayoutTabItemProps } from ".";

function ChromeTabBackground() {
  return (
    <svg
      className="w-full h-full"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <symbol id="chrome-tab-geometry-left" viewBox="0 0 150 36">
          <path d="M17 0h197v36H0v-2c4.5 0 9-3.5 9-8V8c0-4.5 3.5-8 8-8z" />
        </symbol>
        <symbol id="chrome-tab-geometry-right" viewBox="0 0 150 36">
          <use xlinkHref="#chrome-tab-geometry-left" />
        </symbol>
        <clipPath id="crop">
          <rect width="100%" height="100%" x="0" />
        </clipPath>
      </defs>
      <svg width="52%" height="100%">
        <use
          xlinkHref="#chrome-tab-geometry-left"
          width="150"
          height="36"
          className="chrome-tab-geometry"
          fill="currentcolor"
        />
      </svg>
      <g transform="scale(-1, 1)">
        <svg width="52%" height="100%" x="-100%" y="0">
          <use
            xlinkHref="#chrome-tab-geometry-right"
            width="150"
            height="36"
            className="chrome-tab-geometry"
            fill="currentcolor"
          />
        </svg>
      </g>
    </svg>
  );
}
export function ChromeLikeTabItem({ tab }: LayoutTabItemProps) {
  return (
    <div
      key={tab.value}
      className={cn("group peer relative size-full px-2 py-1", {
        active: tab.value === "settings",
      })}
    >
      <div className="absolute top-1/2 left-0 w-[1px] h-3.5 -translate-y-1/2 bg-layout-tabs-border group-[.active]:opacity-0 group-first:opacity-0" />
      <div className="absolute top-1 left-0 bottom-0 w-full group-[.active]:text-layout-tabs-primary text-layout-tabs opacity-0 group-[.active]:opacity-100 overflow-hidden pointer-events-none transition-opacity duration-20">
        <ChromeTabBackground />
      </div>
      <div className="relative h-full flex-items-center gap-2 text-layout-tabs-foreground  hover:text-layout-tabs-primary-foreground hover:bg-layout-tabs-accent group-[.active]:text-layout-tabs-primary-foreground group-[.active]:hover:text-layout-tabs-primary-foreground group-[.active]:hover:bg-layout-tabs-primary leading-none overflow-hidden rounded-md">
        <span className="flex-1 truncate text-sm" title={tab.label || ""}>
          {tab.label}
        </span>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex-center size-4 hover:bg-layout-tabs-close-accent rounded-full cursor-pointer transition-all duration-20">
          <X className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
