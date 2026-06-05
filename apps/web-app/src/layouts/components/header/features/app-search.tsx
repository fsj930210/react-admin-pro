import { Button } from "@rap/components-ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@rap/components-ui/command";
import { Kbd, KbdGroup } from "@rap/components-ui/kbd";
import { Icon } from "@rap/components-pro/icon";
import { useTranslation } from "@rap/i18n";
import { useNavigate } from "@tanstack/react-router";
import { Clock, ExternalLink, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { MenuSearchListItem } from "@/layouts/service/menuService";
import { MenuItemHighlightText } from "../../menu/menu-item-highlight-text";

const SEARCH_RESULT_LIMIT = 30;
const SEARCH_HISTORY_LIMIT = 8;
const SEARCH_HISTORY_STORAGE_KEY = "rap-app-search-history";

interface GlobalSearchFeatureProps {
  className?: string;
}

function HighlightText({ text, searchKeywords }: { text: string; searchKeywords: string[] }) {
  return <MenuItemHighlightText text={text} searchKeywords={searchKeywords} />;
}

function getOpenModeText(item: MenuSearchListItem, t: (key: string) => string) {
  if (item.openMode === "newBrowserTab") return t("header.searchOpenInNewTab");
  if (item.openMode === "iframe") return t("header.searchOpenIframe");
  return t("header.searchOpenCurrent");
}

function readSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    const value = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeSearchHistory(history: string[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function AppSearchFeature({ className }: GlobalSearchFeatureProps) {
  const { t } = useTranslation("webApp");
  const navigate = useNavigate();
  const { menuService } = useLayout();
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [menus, setMenus] = useState<MenuSearchListItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => readSearchHistory());

  const modifierKey = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl";
    return /mac|iphone|ipad|ipod/i.test(navigator.platform) ? "Cmd" : "Ctrl";
  }, []);

  const availableMenus = useMemo(
    () =>
      menus.filter(
        (item) => item.status === "enabled" && !item.hidden && item.type === "menu" && item.url
      ),
    [menus]
  );
  const displayMenus = useMemo(
    () => availableMenus.slice(0, SEARCH_RESULT_LIMIT),
    [availableMenus]
  );
  const normalizedKeyword = keyword.trim();
  const showSearchHistory = normalizedKeyword.length === 0 && searchHistory.length > 0;

  const updateSearchHistory = (value: string) => {
    const nextKeyword = value.trim();
    if (!nextKeyword) return;

    setSearchHistory((prevHistory) => {
      const nextHistory = [
        nextKeyword,
        ...prevHistory.filter((item) => item.toLowerCase() !== nextKeyword.toLowerCase()),
      ].slice(0, SEARCH_HISTORY_LIMIT);

      writeSearchHistory(nextHistory);
      return nextHistory;
    });
  };

  const removeSearchHistory = (value: string) => {
    setSearchHistory((prevHistory) => {
      const nextHistory = prevHistory.filter((item) => item !== value);
      writeSearchHistory(nextHistory);
      return nextHistory;
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setKeyword("");
    }
  };

  const handleSelect = (item: MenuSearchListItem) => {
    if (!item.url) return;
    updateSearchHistory(keyword);
    handleOpenChange(false);

    if (item.openMode === "newBrowserTab") {
      window.open(item.fullUrl ?? item.url, "_blank");
      return;
    }

    navigate({ to: item.openMode === "iframe" ? item.url : (item.fullUrl ?? item.url) });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const requestId = (requestIdRef.current += 1);
    const searchKeyword = keyword.trim().toLowerCase();
    if (searchKeyword) {
      setMenus([]);
    }

    menuService.searchMenuList(searchKeyword).then((menuList) => {
      if (requestId !== requestIdRef.current) return;
      setMenus(menuList.menus);
    });
  }, [keyword, menuService, open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        title={`${t("header.globalSearch")} (${modifierKey}+K)`}
        aria-label={t("header.globalSearch")}
        className={className}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={t("header.globalSearch")}
        description={t("header.searchDescription")}
        className="top-[18%] translate-y-0 p-0 sm:max-w-2xl"
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          value={keyword}
          onValueChange={setKeyword}
          placeholder={t("header.searchPlaceholder")}
        />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{t("header.searchNoResults")}</CommandEmpty>
          {showSearchHistory && (
            <CommandGroup heading={t("header.searchHistoryGroup")}>
              {searchHistory.map((history) => (
                <CommandItem
                  key={history}
                  value={`history-${history}`}
                  onSelect={() => setKeyword(history)}
                  className="gap-3 px-3 py-2"
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{history}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeSearchHistory(history);
                    }}
                    aria-label={t("header.searchHistoryRemove")}
                  >
                    <X className="size-3.5" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading={t("header.searchMenuGroup")}>
            {displayMenus.map((item) => {
              const url = item.fullUrl ?? item.url ?? "";
              const isNewTab = item.openMode === "newBrowserTab";

              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.code} ${url}`}
                  onSelect={() => handleSelect(item)}
                  className="items-start gap-3 px-3 py-2.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {item.icon ? (
                      <Icon icon={item.icon} size={17} />
                    ) : (
                      <Search className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        <HighlightText text={item.title} searchKeywords={item.searchKeywords} />
                      </span>
                      {isNewTab && <ExternalLink className="size-3.5 text-muted-foreground" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      <HighlightText text={url} searchKeywords={item.searchKeywords} />
                    </span>
                  </span>
                  <CommandShortcut className="mt-1 tracking-normal">
                    {getOpenModeText(item, t)}
                  </CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>{t("header.searchFooterTip")}</span>
          <KbdGroup>
            <Kbd>{modifierKey}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </CommandDialog>
    </>
  );
}
