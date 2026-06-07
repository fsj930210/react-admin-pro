import { Button } from "@rap/components-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@rap/components-ui/dialog";
import { Kbd, KbdGroup } from "@rap/components-ui/kbd";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import { useNavigate } from "@tanstack/react-router";
import { Clock, ExternalLink, Search, X } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [menus, setMenus] = useState<MenuSearchListItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
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

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    setActiveIndex(0);
    const searchKeyword = value.trim().toLowerCase();
    const requestId = (requestIdRef.current += 1);

    if (!searchKeyword) {
      setMenus([]);
      return;
    }

    menuService.searchMenuList(searchKeyword).then((menuList) => {
      if (requestId !== requestIdRef.current) return;
      setMenus(menuList.menus);
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
    if (!nextOpen) {
      handleSearchChange("");
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

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleOpenChange(false);
      return;
    }

    if (displayMenus.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex + 1) % displayMenus.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex - 1 + displayMenus.length) % displayMenus.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeMenu = displayMenus[activeIndex] ?? displayMenus[0];
      if (activeMenu) {
        handleSelect(activeMenu);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prevOpen) => {
          const nextOpen = !prevOpen;
          if (nextOpen) {
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
          } else {
            requestIdRef.current += 1;
            setKeyword("");
            setMenus([]);
          }
          return nextOpen;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="top-10 max-w-[calc(100vw-2rem)] translate-y-0 overflow-hidden rounded-2xl border bg-background p-0 shadow-2xl sm:max-w-5xl"
          closable={false}
        >
          <DialogTitle className="sr-only">{t("header.globalSearch")}</DialogTitle>
          <DialogDescription className="sr-only">{t("header.searchDescription")}</DialogDescription>

          <div className="flex h-20 items-center gap-5 border-b px-6">
            <Search className="size-6 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={keyword}
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder={t("header.searchPlaceholder")}
              aria-label={t("header.globalSearch")}
              className="h-full min-w-0 flex-1 bg-transparent text-xl text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Kbd className="h-10 min-w-12 rounded-lg bg-background px-3 text-base shadow-xs ring-1 ring-border">
              esc
            </Kbd>
          </div>

          <div className="max-h-[min(620px,calc(100vh-13rem))] min-h-14 overflow-y-auto">
            {showSearchHistory && (
              <section>
                <h3 className="border-b px-8 py-6 text-xl font-semibold">
                  {t("header.searchHistoryGroup")}
                </h3>
                {searchHistory.map((history) => (
                  <div
                    key={history}
                    className="flex min-h-18 items-center gap-4 border-b px-8 transition-colors hover:bg-muted/40"
                  >
                    <Clock className="size-5 text-muted-foreground" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-lg text-foreground"
                      onClick={() => handleSearchChange(history)}
                    >
                      {history}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeSearchHistory(history);
                      }}
                      aria-label={t("header.searchHistoryRemove")}
                    >
                      <X className="size-5" />
                    </Button>
                  </div>
                ))}
              </section>
            )}
            {normalizedKeyword && displayMenus.length === 0 && (
              <div className="px-8 py-16 text-center text-base text-muted-foreground">
                {t("header.searchNoResults")}
              </div>
            )}
            {displayMenus.length > 0 && (
              <section>
                <h3 className="border-b px-8 py-6 text-xl font-semibold">
                  {t("header.searchMenuGroup")}
                </h3>
                {displayMenus.map((item, index) => {
                  const url = item.fullUrl ?? item.url ?? "";
                  const isNewTab = item.openMode === "newBrowserTab";
                  const isActive = displayMenus[activeIndex]?.id === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex min-h-22 w-full items-center gap-6 border-b px-8 text-left transition-colors",
                        isActive ? "bg-muted/50" : "hover:bg-muted/40"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-lg font-semibold">
                          <span className="truncate">
                            <HighlightText text={item.title} searchKeywords={item.searchKeywords} />
                          </span>
                          {isNewTab && <ExternalLink className="size-3.5 text-muted-foreground" />}
                        </span>
                        <span className="mt-2 block truncate text-base text-muted-foreground">
                          <HighlightText text={url} searchKeywords={item.searchKeywords} />
                        </span>
                      </span>
                      <span className="ml-4 shrink-0 text-sm text-muted-foreground">
                        {getOpenModeText(item, t)}
                      </span>
                    </button>
                  );
                })}
              </section>
            )}
          </div>
          <div className="flex h-14 items-center justify-between border-t px-8 text-sm text-muted-foreground">
            <span>{t("header.searchFooterTip")}</span>
            <KbdGroup>
              <Kbd>{modifierKey}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
