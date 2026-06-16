import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@rap/utils";
import { type ComponentProps } from "react";

const spaceVariants = cva("flex", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    size: {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    align: "center",
    size: "sm",
    wrap: false,
  },
});

const compactVariants = cva(
  [
    "inline-flex w-fit items-stretch",
    "[&>*]:relative [&>*:focus-visible]:z-10 [&>*:focus-within]:z-10",
    "[&>input]:flex-1 [&>[data-slot=input-group]]:flex-1",
    "[&>[data-slot=button]]:h-9 [&>button]:h-9",
    "[&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
    "[&>[data-slot=space-addon]]:shrink-0",
  ],
  {
    variants: {
      direction: {
        horizontal:
          "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      direction: "horizontal",
      block: false,
    },
  }
);

const addonVariants = cva(
  "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground shadow-xs select-none",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-9 px-3 text-sm",
        lg: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

type SpaceSize = VariantProps<typeof spaceVariants>["size"] | number;

interface SpaceProps
  extends Omit<ComponentProps<"div">, "size">, Omit<VariantProps<typeof spaceVariants>, "size"> {
  size?: SpaceSize;
}

interface SpaceCompactProps extends ComponentProps<"div">, VariantProps<typeof compactVariants> {}

interface SpaceAddonProps extends ComponentProps<"div">, VariantProps<typeof addonVariants> {
  asChild?: boolean;
}

function SpaceRoot({
  className,
  direction,
  align,
  size = "sm",
  wrap,
  style,
  ...props
}: SpaceProps) {
  const numericGap = typeof size === "number" ? size : undefined;

  return (
    <div
      data-slot="space"
      data-direction={direction}
      className={cn(
        spaceVariants({
          direction,
          align,
          size: typeof size === "number" ? undefined : size,
          wrap,
        }),
        className
      )}
      style={{ gap: numericGap, ...style }}
      {...props}
    />
  );
}

function SpaceCompact({ className, direction, block, ...props }: SpaceCompactProps) {
  return (
    <div
      role="group"
      data-slot="space-compact"
      data-direction={direction}
      className={cn(compactVariants({ direction, block }), className)}
      {...props}
    />
  );
}

function SpaceAddon({ className, asChild = false, size, ...props }: SpaceAddonProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp data-slot="space-addon" className={cn(addonVariants({ size }), className)} {...props} />
  );
}

const Space = Object.assign(SpaceRoot, {
  Compact: SpaceCompact,
  Addon: SpaceAddon,
});

export {
  Space,
  SpaceAddon,
  SpaceCompact,
  addonVariants as spaceAddonVariants,
  compactVariants as spaceCompactVariants,
  spaceVariants,
};
export type { SpaceAddonProps, SpaceCompactProps, SpaceProps, SpaceSize };
