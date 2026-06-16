import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from "react";
import { icons as carbonIcons } from "@iconify-json/carbon";
import { icons as lucideIcons } from "@iconify-json/lucide";
import { icons as riIcons } from "@iconify-json/ri";
import type { IconifyJSON } from "@iconify/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X } from "lucide-react";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { useTranslation } from "@rap/i18n";
import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rap/components-ui/tooltip";
import { IconifyIcon, ImageIcon, type IconWrapperProps } from "@rap/components-ui/icon";
import * as React from "react";

type IconSize = number | string;

export type IconProps = {
  children?: React.ReactNode;
  icon?: string;
  type?: "image" | "iconify";
  size?: IconSize;
  imageProps?: Omit<React.ComponentProps<typeof ImageIcon>, "src">;
  iconifyProps?: Omit<React.ComponentProps<typeof IconifyIcon>, "icon">;
} & Omit<React.ComponentProps<typeof IconifyIcon>, "icon" | "children" | "title"> &
  Pick<IconWrapperProps, "title" | "wrapperClassName" | "wrapperStyle">;

const imageExtRegExp = /\.(png|jpg|jpeg|gif|webp|bmp|ico|svg)(\?.*)?$/i;

function getSizedProps(size?: IconSize, width?: IconSize, height?: IconSize) {
  const finalWidth = width ?? size;
  const finalHeight = height ?? size;

  return {
    width: finalWidth,
    height: finalHeight,
    fontSize: size,
  };
}

export function Icon({
  title = "",
  children,
  icon,
  type = "iconify",
  size,
  imageProps,
  iconifyProps,
  wrapperClassName,
  wrapperStyle,
  width,
  height,
  fontSize,
  ...rest
}: IconProps) {
  if (children) {
    return children;
  }

  if (!icon) {
    return null;
  }

  const sizedProps = getSizedProps(size ?? fontSize, width, height);
  const shouldRenderImage = type === "image" || imageExtRegExp.test(icon);

  if (shouldRenderImage) {
    const { fontSize: _fontSize, ...imageSizeProps } = sizedProps;

    return (
      <ImageIcon
        wrapperClassName={wrapperClassName}
        wrapperStyle={wrapperStyle}
        title={title}
        {...imageSizeProps}
        {...imageProps}
        src={icon}
      />
    );
  }

  return (
    <IconifyIcon
      wrapperClassName={wrapperClassName}
      wrapperStyle={wrapperStyle}
      title={title}
      {...sizedProps}
      {...rest}
      {...iconifyProps}
      icon={icon}
    />
  );
}

const iconNamesCache = new WeakMap<IconifyJSON, string[]>();

function getIconNames(icons: IconifyJSON) {
  const cached = iconNamesCache.get(icons);

  if (cached) {
    return cached;
  }

  const iconNames = Object.keys(icons.icons);
  iconNamesCache.set(icons, iconNames);

  return iconNames;
}

export interface IconSet {
  prefix: string;
  icons: IconifyJSON;
}

const defaultIconSets: IconSet[] = [
  {
    prefix: "lucide",
    icons: lucideIcons,
  },
  {
    prefix: "carbon",
    icons: carbonIcons,
  },
  {
    prefix: "ri",
    icons: riIcons,
  },
];

export interface IconSelectProps {
  iconSet: IconSet;
  value?: string;
  columns?: number;
  iconSize?: IconSize;
  itemSize?: number;
  gap?: number;
  onChange?: (value: string) => void;
}

export function IconSelect(props: IconSelectProps) {
  const { t } = useTranslation("pro");
  const { iconSet, value, columns, iconSize = 18, itemSize = 32, gap = 6, onChange } = props;
  const listRef = useRef<HTMLDivElement>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [listWidth, setListWidth] = useState(0);
  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const measuredColumns = listWidth > 0 ? Math.floor((listWidth + gap) / (itemSize + gap)) : 6;
  const safeColumns = Math.max(1, columns ?? measuredColumns);

  const iconNames = useMemo(() => getIconNames(iconSet.icons), [iconSet.icons]);

  const filteredIconNames = useMemo(() => {
    const keyword = deferredSearchKeyword.trim().toLowerCase();

    if (!keyword) {
      return iconNames;
    }

    return iconNames.filter((name) => name.toLowerCase().includes(keyword));
  }, [iconNames, deferredSearchKeyword]);

  const rowCount = Math.ceil(filteredIconNames.length / safeColumns);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => listRef.current,
    estimateSize: () => itemSize + gap,
    overscan: 12,
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(([entry]) => {
      setListWidth(entry.contentRect.width);
    });

    observer.observe(list);
    setListWidth(list.clientWidth);

    return () => observer.disconnect();
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  }, []);

  const handleIconClick = useCallback(
    (iconName: string) => {
      onChange?.(`${iconSet.prefix}:${iconName}`);
    },
    [iconSet.prefix, onChange]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <Input
          type="text"
          placeholder={t("icon.searchPlaceholder")}
          value={searchKeyword}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      <div ref={listRef} className="relative h-full flex-1 overflow-auto">
        {filteredIconNames.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">{t("icon.noResults")}</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowIconNames = filteredIconNames.slice(
                virtualRow.index * safeColumns,
                virtualRow.index * safeColumns + safeColumns
              );

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    gap,
                    gridTemplateColumns: `repeat(${safeColumns}, ${itemSize}px)`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid px-1"
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  {rowIconNames.map((name) => {
                    const iconValue = `${iconSet.prefix}:${name}`;
                    const active = iconValue === value;

                    return (
                      <Tooltip key={name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleIconClick(name)}
                            aria-label={iconValue}
                            style={{ width: itemSize, height: itemSize }}
                            className={`flex aspect-square items-center justify-center rounded-md p-1 transition-colors ${
                              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            }`}
                          >
                            <Icon icon={iconValue} size={iconSize} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={4}>
                          {iconValue}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export interface IconViewProps {
  value?: string;
  defaultValue?: string;
  iconSets?: IconSet[];
  disableDefaultIconSets?: boolean;
  defaultIconSet?: string;
  columns?: number;
  iconSize?: IconSize;
  itemSize?: number;
  gap?: number;
  onChange?: (value: string) => void;
  onIconSetChange?: (key: string) => void;
}

export function IconView(props: IconViewProps) {
  const { t } = useTranslation("pro");
  const {
    columns,
    defaultIconSet,
    disableDefaultIconSets,
    gap,
    iconSets,
    iconSize,
    itemSize,
    onIconSetChange,
  } = props;
  const [value, setValue] = useControllableState(props);
  const [activeKey, setActiveKey] = useState(defaultIconSet || "");

  const allIconSets = useMemo(() => {
    const sets = disableDefaultIconSets ? [] : [...defaultIconSets];

    if (iconSets?.length) {
      sets.push(...iconSets);
    }

    return sets;
  }, [iconSets, disableDefaultIconSets]);

  useEffect(() => {
    if (!allIconSets.length) {
      return;
    }

    const preferredKey = defaultIconSet || activeKey;
    const nextActiveKey = allIconSets.some((set) => set.prefix === preferredKey)
      ? preferredKey
      : allIconSets[0].prefix;

    if (nextActiveKey !== activeKey) {
      setActiveKey(nextActiveKey);
      onIconSetChange?.(nextActiveKey);
    }
  }, [activeKey, allIconSets, defaultIconSet, onIconSetChange]);

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveKey(key);
      onIconSetChange?.(key);
    },
    [onIconSetChange]
  );

  if (!allIconSets.length) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
        {t("icon.emptySets")}
      </div>
    );
  }

  return (
    <div className="size-full overflow-hidden">
      <Tabs value={activeKey} onValueChange={handleTabChange} className="flex h-full flex-col">
        <TabsList className="mb-2" variant="line">
          {allIconSets.map((set) => (
            <TabsTrigger key={set.prefix} value={set.prefix}>
              {set.prefix}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {allIconSets.map((set) => (
            <TabsContent key={set.prefix} value={set.prefix} className="h-full">
              <IconSelect
                iconSet={set}
                value={value}
                columns={columns}
                gap={gap}
                iconSize={iconSize}
                itemSize={itemSize}
                onChange={setValue}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

export interface IconPickerProps extends IconViewProps {
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  contentClassName?: string;
  pickerHeight?: number | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IconPicker({
  placeholder,
  disabled,
  clearable = true,
  className,
  contentClassName,
  pickerHeight = 360,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...iconViewProps
}: IconPickerProps) {
  const { t } = useTranslation("pro");
  const [value, setValue] = useControllableState(iconViewProps);
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const handleChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      setOpen(false);
    },
    [setOpen, setValue]
  );

  const handleClear = useCallback(() => {
    setValue("");
  }, [setValue]);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-w-0 flex-1 justify-start"
          >
            {value ? <Icon icon={value} size={18} /> : null}
            <span className="min-w-0 truncate text-left">
              {value || placeholder || t("icon.selectPlaceholder")}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={`w-[min(520px,calc(100vw-2rem))] p-3 ${contentClassName || ""}`}
        >
          <div style={{ height: pickerHeight }}>
            <IconView {...iconViewProps} value={value} onChange={handleChange} />
          </div>
        </PopoverContent>
      </Popover>

      {clearable && value ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={handleClear}
          aria-label={t("icon.clear")}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
