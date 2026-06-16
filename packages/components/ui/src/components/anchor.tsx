"use client";

import { useControllableState } from "@rap/hooks/use-controllable-state";
import { cn } from "@rap/utils";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

type AnchorDirection = "vertical" | "horizontal";
type AnchorTarget = string | HTMLElement | (() => HTMLElement | null);
type AnchorActiveMode = "single" | "visible";

interface AnchorItem {
  key: string;
  title: ReactNode;
  target: AnchorTarget;
  children?: AnchorItem[];
}

interface AnchorProps extends Omit<ComponentProps<"nav">, "onClick" | "onChange"> {
  items: AnchorItem[];
  direction?: AnchorDirection;
  activeKey?: string;
  defaultActiveKey?: string;
  getContainer?: () => Window | HTMLElement;
  offset?: number;
  activeMode?: AnchorActiveMode;
  visibleThreshold?: number;
  bounds?: number;
  scrollBehavior?: ScrollBehavior;
  showInk?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>, item: AnchorItem) => void;
  onChange?: (activeKey: string, item?: AnchorItem) => void;
}

type AnchorInkStyle = CSSProperties;

interface AnchorFlatItem {
  item: AnchorItem;
  level: number;
  parentKeys: string[];
}

interface AnchorActiveEntry {
  key: string;
  link: HTMLButtonElement;
  index: number;
  level: number;
}

type AnchorRootStyle = CSSProperties & {
  "--anchor-indent"?: CSSProperties["paddingLeft"];
};

function flattenItems(items: AnchorItem[], level = 0, parentKeys: string[] = []): AnchorFlatItem[] {
  return items.flatMap((item) => [
    { item, level, parentKeys },
    ...flattenItems(item.children ?? [], level + 1, [...parentKeys, item.key]),
  ]);
}

function getScrollTop(container: Window | HTMLElement) {
  return container instanceof Window ? window.scrollY : container.scrollTop;
}

function getScrollHeight(container: Window | HTMLElement) {
  return container instanceof Window
    ? document.documentElement.scrollHeight
    : container.scrollHeight;
}

function getClientHeight(container: Window | HTMLElement) {
  return container instanceof Window ? window.innerHeight : container.clientHeight;
}

function isScrolledToEnd(container: Window | HTMLElement) {
  const maxScrollTop = getScrollHeight(container) - getClientHeight(container);

  return maxScrollTop - getScrollTop(container) <= 2;
}

function scrollTo(container: Window | HTMLElement, top: number, behavior: ScrollBehavior) {
  if (container instanceof Window) {
    container.scrollTo({ top, behavior });
    return;
  }

  container.scrollTo({ top, behavior });
}

function getElementTop(element: HTMLElement, container: Window | HTMLElement) {
  if (container instanceof Window) {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return elementRect.top - containerRect.top + container.scrollTop;
}

function getElementVisibleRatio(element: HTMLElement, container: Window | HTMLElement) {
  const elementRect = element.getBoundingClientRect();
  const viewportTop = container instanceof Window ? 0 : container.getBoundingClientRect().top;
  const viewportBottom =
    container instanceof Window ? window.innerHeight : container.getBoundingClientRect().bottom;
  const visibleHeight = Math.max(
    0,
    Math.min(elementRect.bottom, viewportBottom) - Math.max(elementRect.top, viewportTop)
  );
  const referenceHeight = Math.min(
    Math.max(elementRect.height, 1),
    Math.max(viewportBottom - viewportTop, 1)
  );

  return visibleHeight / referenceHeight;
}

function isScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;

  return (
    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
    element.scrollHeight > element.clientHeight
  );
}

function getScrollParent(element: HTMLElement | null): Window | HTMLElement {
  let parent = element?.parentElement ?? null;

  while (parent) {
    if (isScrollable(parent)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return window;
}

function resolveTarget(target: AnchorTarget) {
  if (typeof target === "function") {
    return target();
  }

  if (target instanceof HTMLElement) {
    return target;
  }

  const id = target.startsWith("#") ? target.slice(1) : target;
  const elementById = document.getElementById(id);
  if (elementById) {
    return elementById;
  }

  try {
    return document.querySelector<HTMLElement>(target);
  } catch {
    return null;
  }
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Anchor({
  items,
  direction = "vertical",
  activeKey,
  defaultActiveKey,
  getContainer,
  offset,
  bounds = 5,
  scrollBehavior = "smooth",
  showInk = true,
  activeMode = "single",
  visibleThreshold = 0.15,
  className,
  style,
  onClick,
  onChange,
  ref,
  ...props
}: AnchorProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef(new Map<string, HTMLButtonElement>());
  const [inkStyles, setInkStyles] = useState<AnchorInkStyle[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // useMemo keeps tree flattening tied to items changes; scroll and ink logic reuse this derived list.
  const flattenedItems = useMemo(() => flattenItems(items), [items]);
  const visibleItems = useMemo(
    () =>
      direction === "horizontal"
        ? flattenedItems.filter((flatItem) => flatItem.level === 0)
        : flattenedItems,
    [direction, flattenedItems]
  );
  // useMemo keeps link measurement metadata stable until visible items change.
  const visibleItemMeta = useMemo(
    () =>
      new Map(
        visibleItems.map((flatItem, index) => [
          flatItem.item.key,
          {
            index,
            level: flatItem.level,
          },
        ])
      ),
    [visibleItems]
  );
  const [currentActiveKey, setCurrentActiveKey] = useControllableState<string | undefined>(
    { activeKey, defaultActiveKey, onChange },
    {
      valuePropName: "activeKey",
      defaultValuePropName: "defaultActiveKey",
      defaultValue: visibleItems[0]?.item.key,
      trigger: "onChange",
    }
  );

  // useMemo derives parent highlighting from the active key and flattened tree only.
  const activeParents = useMemo(() => {
    const activeItem = flattenedItems.find(({ item }) => item.key === currentActiveKey);

    return new Set(activeItem?.parentKeys ?? []);
  }, [currentActiveKey, flattenedItems]);

  const setActiveItem = useMemoizedFn((item: AnchorItem | undefined) => {
    if (!item || item.key === currentActiveKey) return;

    setCurrentActiveKey(item.key, item);
  });

  const resolveContainer = useMemoizedFn(
    () => getContainer?.() ?? getScrollParent(rootRef.current)
  );

  const getTriggerOffset = useMemoizedFn((container: Window | HTMLElement) => {
    if (typeof offset === "number") return offset;
    if (!rootRef.current) return 0;

    const rootRect = rootRef.current.getBoundingClientRect();
    if (container instanceof Window) {
      return rootRect.top;
    }

    return rootRect.top - container.getBoundingClientRect().top;
  });

  const setActiveItems = useMemoizedFn((activeItems: AnchorItem[]) => {
    const nextActiveKeys = activeItems.map((item) => item.key);
    setActiveKeys((prevKeys) =>
      prevKeys.length === nextActiveKeys.length &&
      prevKeys.every((key, index) => key === nextActiveKeys[index])
        ? prevKeys
        : nextActiveKeys
    );
    setActiveItem(activeItems[activeItems.length - 1]);
  });

  const updateActiveByScroll = useMemoizedFn(() => {
    const container = resolveContainer();
    const currentTop = getScrollTop(container) + getTriggerOffset(container) + bounds;
    const candidates = visibleItems
      .map(({ item }) => {
        const element = resolveTarget(item.target);

        return element ? { element, item, top: getElementTop(element, container) } : null;
      })
      .filter(
        (candidate): candidate is { element: HTMLElement; item: AnchorItem; top: number } =>
          candidate !== null
      )
      .sort((a, b) => a.top - b.top);

    if (candidates.length === 0) return;

    if (activeMode === "visible") {
      const visibleCandidates = candidates.filter(
        (candidate) => getElementVisibleRatio(candidate.element, container) >= visibleThreshold
      );

      setActiveItems(
        visibleCandidates.length > 0
          ? visibleCandidates.map((candidate) => candidate.item)
          : [candidates[0].item]
      );
      return;
    }

    if (isScrolledToEnd(container)) {
      setActiveItems([candidates[candidates.length - 1].item]);
      return;
    }

    let activeIndex = 0;
    for (const [index, candidate] of candidates.entries()) {
      if (candidate.top > currentTop) break;

      activeIndex = index;
    }

    setActiveItems([candidates[activeIndex].item]);
  });

  const updateInk = useMemoizedFn(() => {
    if (!showInk || activeKeys.length === 0 || !rootRef.current) {
      setInkStyles([]);
      return;
    }

    const rootRect = rootRef.current.getBoundingClientRect();
    const activeEntries = activeKeys
      .map((key) => {
        const link = linkRefs.current.get(key);
        const meta = visibleItemMeta.get(key);

        return link && meta ? { key, link, ...meta } : null;
      })
      .filter((entry): entry is AnchorActiveEntry => entry !== null)
      .sort((a, b) => a.index - b.index);

    if (activeEntries.length === 0) {
      setInkStyles([]);
      return;
    }

    const groups: AnchorActiveEntry[][] = [];

    for (const entry of activeEntries) {
      const lastGroup = groups[groups.length - 1];
      const lastEntry = lastGroup?.[lastGroup.length - 1];

      if (
        lastGroup &&
        lastEntry &&
        entry.level === lastEntry.level &&
        entry.index === lastEntry.index + 1
      ) {
        lastGroup.push(entry);
      } else {
        groups.push([entry]);
      }
    }

    const nextInkStyles = groups.map((group) => {
      const firstRect = group[0].link.getBoundingClientRect();
      const lastRect = group[group.length - 1].link.getBoundingClientRect();

      return direction === "horizontal"
        ? {
            left: firstRect.left - rootRect.left,
            width: lastRect.right - firstRect.left,
            height: 2,
          }
        : {
            top: firstRect.top - rootRect.top,
            left: group[0].level === 0 ? 0 : `calc(var(--anchor-indent, 1rem) * ${group[0].level})`,
            height: lastRect.bottom - firstRect.top,
            width: 2,
          };
    });

    setInkStyles(nextInkStyles);
  });

  // useEffect initializes active state from visible items after the route content mounts.
  useEffect(() => {
    if (currentActiveKey || !visibleItems[0]) return;

    setActiveItems([visibleItems[0].item]);
  }, [currentActiveKey, setActiveItems, visibleItems]);

  // useEffect wires scroll/resize listeners to external containers; dependencies recreate listeners when targets change.
  useEffect(() => {
    const container = resolveContainer();
    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveByScroll);
    };

    updateActiveByScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [resolveContainer, updateActiveByScroll]);

  useIsomorphicLayoutEffect(() => {
    updateInk();
  }, [updateInk]);

  // useEffect keeps the ink position synced when the active link changes programmatically.
  useEffect(() => {
    const activeLink = currentActiveKey ? linkRefs.current.get(currentActiveKey) : undefined;
    if (direction === "horizontal" && activeLink) {
      activeLink.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    updateInk();
  }, [currentActiveKey, direction, updateInk]);

  // useEffect observes link list size changes so ink measurements stay correct.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.addEventListener("scroll", updateInk, { passive: true });

    return () => {
      list.removeEventListener("scroll", updateInk);
    };
  }, [updateInk]);

  const handleClick = useMemoizedFn((event: MouseEvent<HTMLButtonElement>, item: AnchorItem) => {
    onClick?.(event, item);
    if (event.defaultPrevented) return;

    const target = resolveTarget(item.target);
    if (!target) return;

    const container = resolveContainer();
    const top = Math.max(getElementTop(target, container) - getTriggerOffset(container), 0);

    setActiveItems([item]);
    scrollTo(container, top, scrollBehavior);
  });

  const setRootRef = useMemoizedFn((node: HTMLElement | null) => {
    rootRef.current = node;

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  });

  const setLinkRef = useMemoizedFn((key: string, node: HTMLButtonElement | null) => {
    if (node) {
      linkRefs.current.set(key, node);
      return;
    }

    linkRefs.current.delete(key);
  });

  const rootStyle = useMemo<AnchorRootStyle | undefined>(
    () =>
      direction === "vertical"
        ? {
            "--anchor-indent": "1rem",
            paddingLeft: "var(--anchor-indent)",
            ...style,
          }
        : style,
    [direction, style]
  );

  const renderItems = useMemoizedFn((anchorItems: AnchorItem[], level = 0) => (
    <ul
      data-level={level}
      data-slot="anchor-list"
      ref={level === 0 ? listRef : undefined}
      style={
        direction === "vertical" && level > 0
          ? { paddingLeft: "var(--anchor-indent, 1rem)" }
          : undefined
      }
      className={cn(
        "m-0 list-none p-0",
        direction === "horizontal" && level === 0
          ? "flex max-w-full items-center gap-1 overflow-x-auto"
          : "space-y-1",
        direction === "vertical" && level > 0 && "mt-1"
      )}
    >
      {anchorItems.map((item) => {
        const isActive = currentActiveKey === item.key;
        const isActiveKey = activeKeys.includes(item.key);
        const isParentActive = activeParents.has(item.key);
        const children = direction === "vertical" ? item.children : undefined;

        return (
          <li
            key={item.key}
            data-active={isActive ? "" : undefined}
            data-parent-active={isParentActive ? "" : undefined}
            data-slot="anchor-item"
          >
            <button
              type="button"
              data-level={level}
              data-slot="anchor-link"
              data-current={isActive ? "" : undefined}
              data-state={isActiveKey ? "active" : undefined}
              ref={(node) => setLinkRef(item.key, node)}
              className={cn(
                "inline-flex max-w-full items-center rounded-sm px-2 py-1 text-left text-sm leading-5 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
                direction === "vertical" && "w-full justify-start",
                direction === "horizontal" && "justify-center",
                (isActiveKey || isParentActive) && "font-medium text-primary hover:text-primary"
              )}
              onClick={(event) => handleClick(event, item)}
            >
              {item.title}
            </button>
            {children?.length ? renderItems(children, level + 1) : null}
          </li>
        );
      })}
    </ul>
  ));

  return (
    <nav
      data-orientation={direction}
      data-slot="anchor"
      {...props}
      ref={setRootRef}
      style={rootStyle}
      className={cn("relative", direction === "horizontal" && "pb-2", className)}
    >
      {showInk ? (
        <div
          aria-hidden="true"
          data-slot="anchor-rail"
          className={cn(
            "absolute rounded-full bg-border",
            direction === "vertical" ? "inset-y-0 left-0 w-px" : "inset-x-0 bottom-0 h-px"
          )}
        >
          {inkStyles.map((inkStyle, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Ink styles are positional measurements.
              key={index}
              data-slot="anchor-ink"
              className={cn(
                "absolute rounded-full bg-primary transition-all duration-200 ease-out",
                direction === "vertical" ? "left-0" : "bottom-0"
              )}
              style={inkStyle}
            />
          ))}
        </div>
      ) : null}
      {renderItems(items)}
    </nav>
  );
}

export {
  Anchor,
  type AnchorActiveMode,
  type AnchorDirection,
  type AnchorItem,
  type AnchorProps,
  type AnchorTarget,
};
