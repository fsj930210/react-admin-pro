"use client";

import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ComponentProps,
  type RefObject,
} from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { type VariantProps, cva } from "class-variance-authority";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { useIsMobile } from "@rap/hooks/use-mobile";
import { composeRefs } from "@rap/utils/compose-refs";
import { cn } from "@rap/utils";
import { Button } from "../button";
import { Input } from "../input";
import { Separator } from "../separator";
import { Sheet, SheetContent } from "../sheet";
import { Skeleton } from "../skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";
import { useSidebarResize } from "./use-sidebar-resize";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

//* new constants for sidebar resizing
const MIN_SIDEBAR_WIDTH = "14rem";
const MAX_SIDEBAR_WIDTH = "22rem";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  //* new properties for sidebar resizing
  width: string;
  setWidth: (width: string) => void;
  //* new properties for tracking is dragging rail
  isDraggingRail: boolean;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
};

const SidebarContext = createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = use(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

type SidebarProviderProps = ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultWidth?: string;
  collapsedWidth?: string;
  ref?: RefObject<HTMLDivElement>;
};

const SidebarProvider = ({
  ref,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  defaultWidth = SIDEBAR_WIDTH,
  collapsedWidth = SIDEBAR_WIDTH_ICON,
  ...props
}: SidebarProviderProps) => {
  const isMobile = useIsMobile();
  //* new state for sidebar width
  const [width, setWidth] = useState(defaultWidth);
  const [openMobile, setOpenMobile] = useState(false);
  //* new state for tracking is dragging rail
  const [isDraggingRail, setIsDraggingRail] = useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useMemoizedFn((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  });

  // Helper to toggle the sidebar.
  const toggleSidebar = useMemoizedFn(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  });

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  useEffect(() => {
    setWidth(defaultWidth);
  }, [defaultWidth]);

  const contextValue = useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      //* new context for sidebar resizing
      width,
      setWidth,
      //* new context for tracking is dragging rail
      isDraggingRail,
      setIsDraggingRail,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      //* remove setOpenMobile from dependencies because setOpenMobile are state setters created by useState
      // setOpenMobile,
      toggleSidebar,
      //* add width to dependencies
      width,
      //* add isDraggingRail to dependencies
      isDraggingRail,
    ]
  );

  return (
    <SidebarContext value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              // * update '--sidebar-width' to use the new width state
              "--sidebar-width": width,
              "--sidebar-width-icon": collapsedWidth,
              ...style,
            } as CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext>
  );
};

SidebarProvider.displayName = "SidebarProvider";

type SidebarProps = ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  ref?: RefObject<HTMLDivElement>;
};

const Sidebar = ({
  ref,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: SidebarProps) => {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile,
    //* new property for tracking is dragging rail
    isDraggingRail,
  } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as CSSProperties
          }
          side={side}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden md:block text-sidebar-foreground"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      //* add data-dragging attribute
      data-dragging={isDraggingRail}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "duration-200 relative h-svh w-(--sidebar-width) bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          //* set duration to 0 for all elements when dragging
          "group-data-[dragging=true]:duration-0! group-data-[dragging=true]_*:duration-0!"
        )}
      />
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          //* set duration to 0 for all elements when dragging
          "group-data-[dragging=true]:duration-0! group-data-[dragging=true]_*:duration-0!",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
Sidebar.displayName = "Sidebar";

type SidebarTriggerProps = ComponentProps<typeof Button> & {
  ref?: RefObject<HTMLButtonElement>;
};

const SidebarTrigger = ({ ref, className, onClick, ...props }: SidebarTriggerProps) => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7 cursor-pointer", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {state === "expanded" ? (
        <PanelLeftClose className="size-5" />
      ) : (
        <PanelLeftOpen className="size-5" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};
SidebarTrigger.displayName = "SidebarTrigger";

type SidebarRailProps = ComponentProps<"button"> & {
  enableDrag?: boolean;
  minResizeWidth?: string;
  maxResizeWidth?: string;
  ref?: RefObject<HTMLButtonElement>;
};

const SidebarRail = ({
  ref,
  className,
  enableDrag = true,
  minResizeWidth = MIN_SIDEBAR_WIDTH,
  maxResizeWidth = MAX_SIDEBAR_WIDTH,
  ...props
}: SidebarRailProps) => {
  const { toggleSidebar, setWidth, state, width, setIsDraggingRail } = useSidebar();

  const { dragRef, handleMouseDown } = useSidebarResize({
    direction: "right",
    enableDrag,
    onResize: setWidth,
    onToggle: toggleSidebar,
    currentWidth: width,
    isCollapsed: state === "collapsed",
    minResizeWidth,
    maxResizeWidth,
    setIsDraggingRail,
    widthCookieName: "sidebar:width",
    widthCookieMaxAge: 60 * 60 * 24 * 7,
  });

  const combinedRef = useMemo(() => composeRefs(ref, dragRef), [ref, dragRef]);
  return (
    <button
      ref={combinedRef}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onMouseDown={handleMouseDown}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  );
};
SidebarRail.displayName = "SidebarRail";

type SidebarInsetProps = ComponentProps<"main"> & {
  ref?: RefObject<HTMLElement>;
};

const SidebarInset = ({ ref, className, ...props }: SidebarInsetProps) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        className
      )}
      {...props}
    />
  );
};
SidebarInset.displayName = "SidebarInset";

type SidebarInputProps = ComponentProps<typeof Input> & {
  ref?: RefObject<HTMLInputElement>;
};

const SidebarInput = ({ ref, className, ...props }: SidebarInputProps) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  );
};
SidebarInput.displayName = "SidebarInput";

type SidebarHeaderProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarHeader = ({ ref, className, ...props }: SidebarHeaderProps) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
};
SidebarHeader.displayName = "SidebarHeader";

type SidebarFooterProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarFooter = ({ ref, className, ...props }: SidebarFooterProps) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
};
SidebarFooter.displayName = "SidebarFooter";

type SidebarSeparatorProps = ComponentProps<typeof Separator> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarSeparator = ({ ref, className, ...props }: SidebarSeparatorProps) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
};
SidebarSeparator.displayName = "SidebarSeparator";

type SidebarContentProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarContent = ({ ref, className, ...props }: SidebarContentProps) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  );
};
SidebarContent.displayName = "SidebarContent";

type SidebarGroupProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarGroup = ({ ref, className, ...props }: SidebarGroupProps) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
};
SidebarGroup.displayName = "SidebarGroup";

type SidebarGroupLabelProps = ComponentProps<"div"> & {
  asChild?: boolean;
  ref?: RefObject<HTMLDivElement>;
};

const SidebarGroupLabel = ({
  ref,
  className,
  asChild = false,
  ...props
}: SidebarGroupLabelProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "div";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  );
};
SidebarGroupLabel.displayName = "SidebarGroupLabel";

type SidebarGroupActionProps = ComponentProps<"button"> & {
  asChild?: boolean;
  ref?: RefObject<HTMLButtonElement>;
};

const SidebarGroupAction = ({
  ref,
  className,
  asChild = false,
  ...props
}: SidebarGroupActionProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
};
SidebarGroupAction.displayName = "SidebarGroupAction";

type SidebarGroupContentProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarGroupContent = ({ ref, className, ...props }: SidebarGroupContentProps) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
);
SidebarGroupContent.displayName = "SidebarGroupContent";

type SidebarMenuProps = ComponentProps<"ul"> & {
  ref?: RefObject<HTMLUListElement>;
};

const SidebarMenu = ({ ref, className, ...props }: SidebarMenuProps) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
);
SidebarMenu.displayName = "SidebarMenu";

type SidebarMenuItemProps = ComponentProps<"li"> & {
  ref?: RefObject<HTMLLIElement>;
};

const SidebarMenuItem = ({ ref, className, ...props }: SidebarMenuItemProps) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type SidebarMenuButtonProps = ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | ComponentProps<typeof TooltipContent>;
  ref?: RefObject<HTMLButtonElement>;
} & VariantProps<typeof sidebarMenuButtonVariants>;

const SidebarMenuButton = ({
  ref,
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
};
SidebarMenuButton.displayName = "SidebarMenuButton";

type SidebarMenuActionProps = ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
  ref?: RefObject<HTMLButtonElement>;
};

const SidebarMenuAction = ({
  ref,
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  );
};
SidebarMenuAction.displayName = "SidebarMenuAction";

type SidebarMenuBadgeProps = ComponentProps<"div"> & {
  ref?: RefObject<HTMLDivElement>;
};

const SidebarMenuBadge = ({ ref, className, ...props }: SidebarMenuBadgeProps) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute top-1/2 right-1 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

type SidebarMenuSkeletonProps = ComponentProps<"div"> & {
  showIcon?: boolean;
  ref?: RefObject<HTMLDivElement>;
};

const SidebarMenuSkeleton = ({
  ref,
  className,
  showIcon = false,
  ...props
}: SidebarMenuSkeletonProps) => {
  const width = useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 flex-1 max-w-(--skeleton-width)"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as CSSProperties
        }
      />
    </div>
  );
};
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

type SidebarMenuSubProps = ComponentProps<"ul"> & {
  ref?: RefObject<HTMLUListElement>;
};

const SidebarMenuSub = ({ ref, className, ...props }: SidebarMenuSubProps) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
);
SidebarMenuSub.displayName = "SidebarMenuSub";

type SidebarMenuSubItemProps = ComponentProps<"li"> & {
  ref?: RefObject<HTMLLIElement>;
};

const SidebarMenuSubItem = ({ ref, ...props }: SidebarMenuSubItemProps) => (
  <li ref={ref} {...props} />
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

type SidebarMenuSubButtonProps = ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
  ref?: RefObject<HTMLAnchorElement>;
};

const SidebarMenuSubButton = ({
  asChild = false,
  size = "md",
  isActive,
  ref,
  className,
  ...props
}: SidebarMenuSubButtonProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "a";

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
};
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
