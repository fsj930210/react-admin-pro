import { cn } from "@rap/utils";
import type { DataGridElementProps } from "../types";

const eventPattern = /^on[A-Z]/;

/**
 * Merges user supplied row/cell props with internal table props.
 *
 * Rules:
 * - `className` is concatenated with the project `cn` helper.
 * - `style` is shallow merged so user styles can override individual values.
 * - event handlers are composed with the user handler first. If it calls
 *   `preventDefault()`, the internal handler is skipped. This lets consumers
 *   opt out of built-in behaviors such as the context menu without needing a
 *   separate escape-hatch prop.
 * - `data-*`, `aria-*`, ids, titles, and other DOM props are copied normally,
 *   with user props taking precedence for non-event scalar values.
 */
export function mergeElementProps<TEvent extends { defaultPrevented?: boolean } = never>(
  internalProps?: DataGridElementProps,
  userProps?: DataGridElementProps
): DataGridElementProps {
  if (!internalProps) return userProps ?? {};
  if (!userProps) return internalProps;

  const merged: Record<string, unknown> = {
    ...internalProps,
    ...userProps,
    className: cn(internalProps.className, userProps.className),
    style: {
      ...internalProps.style,
      ...userProps.style,
    },
  };

  for (const key of new Set([...Object.keys(internalProps), ...Object.keys(userProps)])) {
    if (!eventPattern.test(key)) continue;
    const internalHandler = internalProps[key as keyof DataGridElementProps];
    const userHandler = userProps[key as keyof DataGridElementProps];

    if (typeof internalHandler === "function" && typeof userHandler === "function") {
      merged[key] = (event: TEvent, ...args: unknown[]) => {
        (userHandler as (event: TEvent, ...args: unknown[]) => void)(event, ...args);
        if (!event.defaultPrevented) {
          (internalHandler as (event: TEvent, ...args: unknown[]) => void)(event, ...args);
        }
      };
    }
  }

  return merged as DataGridElementProps;
}
