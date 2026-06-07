import { bfsSearch, traverseTree } from "@rap/utils";
import { pinyin } from "pinyin-pro";
import type { FlatMenuItem, MenuItem } from "../types";

interface MenuSearchListResult {
  menus: FlatMenuItem[];
  searchKeywords: string[];
}

interface MenuSearchTreeResult {
  menus: MenuItem[];
  expandKeys: string[];
  searchKeywords: string[];
}

export interface MenuSearchResult {
  menuList: MenuSearchListResult;
  menuTree: MenuSearchTreeResult;
}

export interface MenuSearchListItem extends FlatMenuItem {
  searchKeywords: string[];
}

interface AppSearchListResult {
  menus: MenuSearchListItem[];
  searchKeywords: string[];
}

export interface HighlightPart {
  text: string;
  matched: boolean;
}

export interface SidebarSearchResult {
  visibleIds: Set<string>;
  matchedIds: Set<string>;
  expandedIds: string[];
  searchKeywords: string[];
  highlightsById: Map<string, HighlightPart[]>;
}

interface MenuSearchIndexItem {
  item: FlatMenuItem;
  titleLower: string;
  codeLower: string;
  url: string;
  urlLower: string;
  pinyinFull: string;
  pinyinInitials: string;
  pinyinWords: string;
}

function normalizeUrl(url = "") {
  return url.split("?")[0].split("#")[0].replace(/\/$/, "");
}

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function normalizePinyinText(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

function getMenuUrl(item: Pick<MenuItem, "fullUrl" | "url">) {
  return item.fullUrl ?? item.url ?? "";
}

function splitTextByMatches(text: string, keywords: string[]): HighlightPart[] {
  const filteredKeywords = Array.from(new Set(keywords.filter(Boolean))).sort(
    (a, b) => b.length - a.length
  );

  if (filteredKeywords.length === 0) return [{ text, matched: false }];

  const regex = new RegExp(
    `(${filteredKeywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  return text
    .split(regex)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      matched: filteredKeywords.some((keyword) => part.toLowerCase() === keyword.toLowerCase()),
    }));
}

export class MenuService {
  readonly menus: MenuItem[];
  readonly flatMenus: FlatMenuItem[];
  private readonly menuById = new Map<string, FlatMenuItem>();
  private readonly menuByCode = new Map<string, FlatMenuItem>();
  private readonly menuByUrl = new Map<string, FlatMenuItem>();
  private readonly childrenByParentId = new Map<string | null, MenuItem[]>();
  private readonly ancestorIdsById = new Map<string, string[]>();
  private readonly firstChildMenuById = new Map<string, MenuItem | null>();
  private readonly searchIndex: MenuSearchIndexItem[];

  constructor(menus: MenuItem[]) {
    this.menus = menus;
    this.flatMenus = this.flattenMenus(menus);
    this.indexMenus();
    this.searchIndex = this.createSearchIndex();
  }

  private flattenMenus(menuList: MenuItem[] = []): FlatMenuItem[] {
    const result: FlatMenuItem[] = [];

    traverseTree(menuList, (menu, currentLevel, path) => {
      result.push({
        ...menu,
        level: currentLevel,
        path: path.map((node) => node.code),
      });
    });

    return result;
  }

  private indexMenus() {
    for (const item of this.flatMenus) {
      this.menuById.set(item.id, item);
      this.menuByCode.set(item.code, item);

      const menuUrl = normalizeUrl(getMenuUrl(item));
      if (menuUrl) this.menuByUrl.set(menuUrl, item);

      const siblings = this.childrenByParentId.get(item.parentId) ?? [];
      siblings.push(item);
      this.childrenByParentId.set(item.parentId, siblings);
    }

    for (const item of this.flatMenus) {
      this.ancestorIdsById.set(item.id, this.findAncestorIds(item.id));
      this.firstChildMenuById.set(item.id, this.findFirstChildMenu(item));
    }
  }

  private createSearchIndex(): MenuSearchIndexItem[] {
    return this.flatMenus.map((item) => {
      const titlePinyin = pinyin(item.title, {
        type: "array",
        toneType: "none",
        v: true,
      });
      const url = getMenuUrl(item);

      return {
        item,
        titleLower: item.title.toLowerCase(),
        codeLower: item.code.toLowerCase(),
        url,
        urlLower: url.toLowerCase(),
        pinyinFull: titlePinyin.join("").toLowerCase(),
        pinyinInitials: titlePinyin
          .map((word) => word.charAt(0))
          .join("")
          .toLowerCase(),
        pinyinWords: titlePinyin.join(" ").toLowerCase(),
      };
    });
  }

  private findAncestorIds(menuId: string): string[] {
    const ancestorIds: string[] = [];
    let current = this.menuById.get(menuId);

    while (current?.parentId) {
      const parent = this.menuById.get(current.parentId);
      if (!parent) break;
      ancestorIds.unshift(parent.id);
      current = parent;
    }

    return ancestorIds;
  }

  private getTextMatchTexts(searchKeyword: string, sourceText: string): string[] {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;

    const key = normalizeSearchText(searchKeyword);
    const textLower = sourceText.toLowerCase();
    const keyLen = key.length;
    let start = textLower.indexOf(key);

    while (start > -1) {
      const realText = sourceText.substring(start, start + keyLen);
      if (!matchTexts.includes(realText)) matchTexts.push(realText);
      start = textLower.indexOf(key, start + keyLen);
    }

    return matchTexts;
  }

  private getSearchMatchTexts(indexItem: MenuSearchIndexItem, searchKeyword: string) {
    const pinyinKeyword = normalizePinyinText(searchKeyword);
    const titleMatchTexts = this.getTextMatchTexts(searchKeyword, indexItem.item.title);
    const codeMatchTexts = this.getTextMatchTexts(searchKeyword, indexItem.item.code);
    const urlMatchTexts = this.getTextMatchTexts(searchKeyword, indexItem.url);
    const pinyinMatched =
      !!pinyinKeyword &&
      (indexItem.pinyinFull.includes(pinyinKeyword) ||
        indexItem.pinyinInitials.includes(pinyinKeyword) ||
        indexItem.pinyinWords.includes(searchKeyword));
    const searchKeywords = [...titleMatchTexts, ...codeMatchTexts, ...urlMatchTexts];

    if (pinyinMatched && titleMatchTexts.length === 0) {
      searchKeywords.push(indexItem.item.title);
    }

    return Array.from(new Set(searchKeywords));
  }

  private getMatchedIndexItems(keyword: string) {
    const searchKeyword = normalizeSearchText(keyword);
    if (!searchKeyword) return [];

    return this.searchIndex
      .map((indexItem) => ({
        indexItem,
        searchKeywords: this.getSearchMatchTexts(indexItem, searchKeyword),
      }))
      .filter(({ searchKeywords }) => searchKeywords.length > 0);
  }

  private filterMenuTree(visibleIds: Set<string>, menuList: MenuItem[] = this.menus): MenuItem[] {
    const result: MenuItem[] = [];

    for (const item of menuList) {
      if (!visibleIds.has(item.id)) continue;

      const children = item.children ? this.filterMenuTree(visibleIds, item.children) : undefined;
      result.push({
        ...item,
        children: children && children.length > 0 ? children : item.children,
      });
    }

    return result;
  }

  findMenuById(menuId: string): MenuItem | null {
    return this.menuById.get(menuId) ?? null;
  }

  findMenuByCode(code: string): MenuItem | null {
    return this.menuByCode.get(code) ?? null;
  }

  findMenuForTab(tab: Pick<MenuItem, "code" | "id" | "url">): MenuItem | null {
    return (
      this.findMenuByCode(tab.code) ??
      this.findMenuById(tab.id) ??
      this.findMenuByUrl(tab.url ?? "")
    );
  }

  findMenuByUrl(url: string): MenuItem | null {
    return this.menuByUrl.get(normalizeUrl(url)) ?? null;
  }

  findMenuAncestor(menuId: string): MenuItem[] {
    return (this.ancestorIdsById.get(menuId) ?? [])
      .map((id) => this.findMenuById(id))
      .filter(Boolean) as MenuItem[];
  }

  getMenuChildren(parentId: string | null) {
    return this.childrenByParentId.get(parentId) ?? [];
  }

  getMenuUrl(item: Pick<MenuItem, "fullUrl" | "url">): string {
    return getMenuUrl(item);
  }

  searchSidebar(keyword: string): SidebarSearchResult {
    const searchKeyword = normalizeSearchText(keyword);
    const visibleIds = new Set<string>();
    const matchedIds = new Set<string>();
    const expandedIds = new Set<string>();
    const searchKeywords: string[] = [];
    const highlightsById = new Map<string, HighlightPart[]>();

    if (!searchKeyword) {
      return {
        visibleIds,
        matchedIds,
        expandedIds: [],
        searchKeywords: [],
        highlightsById,
      };
    }

    for (const { indexItem, searchKeywords: itemSearchKeywords } of this.getMatchedIndexItems(
      searchKeyword
    )) {
      const item = indexItem.item;
      matchedIds.add(item.id);
      visibleIds.add(item.id);
      searchKeywords.push(...itemSearchKeywords);
      highlightsById.set(item.id, splitTextByMatches(item.title, itemSearchKeywords));

      for (const ancestorId of this.ancestorIdsById.get(item.id) ?? []) {
        visibleIds.add(ancestorId);
        expandedIds.add(ancestorId);
      }
    }

    return {
      visibleIds,
      matchedIds,
      expandedIds: Array.from(expandedIds),
      searchKeywords: Array.from(new Set(searchKeywords)),
      highlightsById,
    };
  }

  async searchMenus(keyword: string, pinyinSearch = true): Promise<MenuSearchResult> {
    const [menuList, menuTree] = await Promise.all([
      this.searchMenusReturnList(keyword, pinyinSearch),
      this.searchMenusReturnTree(keyword, pinyinSearch),
    ]);

    return { menuList, menuTree };
  }

  async searchMenuTree(keyword: string, _pinyinSearch = true): Promise<MenuSearchTreeResult> {
    return this.searchMenusReturnTree(keyword);
  }

  async searchMenuList(keyword: string): Promise<AppSearchListResult> {
    const searchKeyword = normalizeSearchText(keyword);
    if (!searchKeyword) return { menus: [], searchKeywords: [] };

    const menus: MenuSearchListItem[] = [];
    const searchKeywords: string[] = [];

    for (const { indexItem, searchKeywords: itemSearchKeywords } of this.getMatchedIndexItems(
      searchKeyword
    )) {
      const item = indexItem.item;
      searchKeywords.push(...itemSearchKeywords);
      menus.push({
        ...item,
        searchKeywords: itemSearchKeywords,
      });
    }

    return { menus, searchKeywords: Array.from(new Set(searchKeywords)) };
  }

  private async searchMenusReturnList(
    keyword: string,
    _pinyinSearch = true
  ): Promise<MenuSearchListResult> {
    const searchKeyword = normalizeSearchText(keyword);
    if (!searchKeyword) return { menus: this.flatMenus, searchKeywords: [] };

    const menus: FlatMenuItem[] = [];
    const searchKeywords: string[] = [];

    for (const { indexItem, searchKeywords: itemSearchKeywords } of this.getMatchedIndexItems(
      searchKeyword
    )) {
      searchKeywords.push(...itemSearchKeywords);
      menus.push(indexItem.item);
    }

    return { menus, searchKeywords: Array.from(new Set(searchKeywords)) };
  }

  private async searchMenusReturnTree(
    keyword: string,
    _pinyinSearch = true
  ): Promise<MenuSearchTreeResult> {
    const searchKeyword = normalizeSearchText(keyword);
    if (!searchKeyword) return { menus: this.menus, expandKeys: [], searchKeywords: [] };

    const searchResult = this.searchSidebar(searchKeyword);

    return {
      menus: this.filterMenuTree(searchResult.visibleIds),
      expandKeys: searchResult.expandedIds,
      searchKeywords: searchResult.searchKeywords,
    };
  }

  findFirstChildMenu(
    item: MenuItem,
    comparator?: (item: MenuItem) => MenuItem | null
  ): MenuItem | null {
    if (item.type === "menu" || !item.children || item.children.length === 0) {
      return item;
    }

    if (comparator) return comparator(item);

    const cachedMenu = this.firstChildMenuById.get(item.id);
    if (cachedMenu !== undefined) return cachedMenu;

    return bfsSearch(item.children, (node) => node.type === "menu");
  }
}
