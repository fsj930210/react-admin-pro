import { bfsSearch, traverseTree } from "@rap/utils";
import type { FlatMenuItem, MenuItem } from "../types";
import type { pinyin as pinyinFunction } from "pinyin-pro";

type Pinyin = typeof pinyinFunction;

interface MenuSearchListResult {
  menus: MenuSearchListItem[];
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

interface MenuSearchIndexItem {
  item: FlatMenuItem;
  titleLower: string;
  codeLower: string;
  url: string;
  urlLower: string;
  pinyinFull?: string;
  pinyinInitials?: string;
}

let pinyinLoader: Promise<Pinyin> | null = null;

function loadPinyin(): Promise<Pinyin> {
  pinyinLoader ??= import("pinyin-pro").then((module) => module.pinyin);
  return pinyinLoader;
}

export class MenuService {
  menus: MenuItem[];
  private cachedFlatMenus: FlatMenuItem[] | null = null;
  private cachedSearchIndex: MenuSearchIndexItem[] | null = null;
  private cachedPinyinSearchIndex: Promise<MenuSearchIndexItem[]> | null = null;

  constructor(menus: MenuItem[]) {
    this.menus = menus;
  }
  private flattenMenus(menuList: MenuItem[] = []): FlatMenuItem[] {
    const result: FlatMenuItem[] = [];

    traverseTree(menuList, (menu, currentLevel, path) => {
      const codePath = path.map((node) => node.code);
      const flatMenu: FlatMenuItem = {
        ...menu,
        level: currentLevel,
        path: codePath,
      };
      result.push(flatMenu);
    });

    return result;
  }

  get flatMenus() {
    this.cachedFlatMenus ??= this.flattenMenus(this.menus);
    return this.cachedFlatMenus;
  }
  findMenuById(menuId: string): MenuItem | null {
    return this.flatMenus.find((item) => item.id === menuId) ?? null;
  }

  findMenuByCode(code: string): MenuItem | null {
    return this.flatMenus.find((item) => item.code === code) ?? null;
  }

  findMenuForTab(tab: Pick<MenuItem, "code" | "id" | "url">): MenuItem | null {
    return (
      this.findMenuByCode(tab.code) ??
      this.findMenuById(tab.id) ??
      this.findMenuByUrl(tab.url ?? "")
    );
  }

  findMenuByUrl(url: string): MenuItem | null {
    const normalizeUrl = (url: string) => {
      return url.split("?")[0].split("#")[0].replace(/\/$/, "");
    };
    const targetUrl = normalizeUrl(url);
    return this.flatMenus.find((menu) => normalizeUrl(menu.url ?? "") === targetUrl) ?? null;
  }

  findMenuAncestor(menuId: string): MenuItem[] {
    const ancestor: MenuItem[] = [];
    let current = this.findMenuById(menuId);

    while (current) {
      ancestor.unshift(current);
      if (current.parentId) {
        current = this.findMenuById(current.parentId);
      } else {
        break;
      }
    }
    return ancestor;
  }
  private getTextMatchTexts(searchKeyword: string, sourceText: string): string[] {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const textLower = sourceText.toLowerCase();
    const keyLen = key.length;
    let start = 0;
    start = textLower.indexOf(key, start);
    while (start > -1) {
      const realText = sourceText.substring(start, start + keyLen);
      if (!matchTexts.includes(realText)) {
        matchTexts.push(realText);
      }
      start += keyLen;
    }
    return matchTexts;
  }

  private getPinyinMatchTexts(searchKeyword: string, sourceText: string, pinyin: Pinyin): string[] {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const keyLen = key.length;
    const pyArr = pinyin(sourceText, { type: "array", toneType: "none", v: true });
    const charArr = sourceText.split("");
    const yunMuWhiteList = [
      "an",
      "ang",
      "ong",
      "eng",
      "ing",
      "ian",
      "iao",
      "uan",
      "uang",
      "uen",
      "uei",
      "iong",
    ];
    const isOnlyYunMu = yunMuWhiteList.includes(key);
    charArr.forEach((char, idx) => {
      const currPy = pyArr[idx] ?? "";
      if ((currPy === key || currPy.startsWith(key)) && char && !matchTexts.includes(char)) {
        matchTexts.push(char);
      }
    });
    if (isOnlyYunMu && matchTexts.length === 0) {
      charArr.forEach((char, idx) => {
        const currPy = pyArr[idx] || "";
        if (currPy === key && char) matchTexts.push(char);
      });
    }

    if (keyLen > 1 && !isOnlyYunMu && matchTexts.length === 0) {
      for (let i = 0; i < pyArr.length; i++) {
        let currPy = "";
        let currInitial = "";
        let currChar = "";
        for (let j = i; j < pyArr.length; j++) {
          const py = pyArr[j] ?? "";
          currPy += py;
          currInitial += py.charAt(0);
          currChar += charArr[j];
          if (currPy === key || currInitial === key) {
            if (!matchTexts.includes(currChar)) {
              matchTexts.push(currChar);
            }
            break;
          }
          if (currPy.length > keyLen && currInitial.length > keyLen) break;
        }
      }
    }
    return [...new Set(matchTexts)].filter(Boolean);
  }

  private getMenuUrl(item: MenuItem): string {
    return item.fullUrl ?? item.url ?? "";
  }

  private getSearchIndexBase(): MenuSearchIndexItem[] {
    this.cachedSearchIndex ??= this.flatMenus.map((item) => {
      const url = this.getMenuUrl(item);
      return {
        item,
        titleLower: item.title.toLowerCase(),
        codeLower: item.code.toLowerCase(),
        url,
        urlLower: url.toLowerCase(),
      };
    });
    return this.cachedSearchIndex;
  }

  private getPinyinSearchIndex(): Promise<MenuSearchIndexItem[]> {
    this.cachedPinyinSearchIndex ??= loadPinyin().then((pinyin) =>
      this.getSearchIndexBase().map((indexItem) => {
        const pinyinArray = pinyin(indexItem.item.title, {
          type: "array",
          toneType: "none",
          v: true,
        });

        return {
          ...indexItem,
          pinyinFull: pinyinArray.join("").toLowerCase(),
          pinyinInitials: pinyinArray
            .map((item) => item.charAt(0))
            .join("")
            .toLowerCase(),
        };
      })
    );

    return this.cachedPinyinSearchIndex;
  }

  private async searchMenusReturnList(
    keyword: string,
    pinyinSearch = true
  ): Promise<MenuSearchListResult> {
    if (!keyword.trim()) {
      return {
        menus: this.flatMenus.map((item) => ({ ...item, searchKeywords: [] })),
        searchKeywords: [],
      };
    }

    const searchKeyword = keyword.toLowerCase().trim();
    const searchKeywords: string[] = [];
    const matchedMenus: MenuSearchListItem[] = [];
    const searchIndex = pinyinSearch
      ? await this.getPinyinSearchIndex()
      : this.getSearchIndexBase();

    for (const indexItem of searchIndex) {
      const { item, url } = indexItem;
      const itemSearchKeywords: string[] = [];
      const titleMatchTexts = this.getTextMatchTexts(searchKeyword, item.title);
      const codeMatchTexts = this.getTextMatchTexts(searchKeyword, item.code);
      const urlMatchTexts = this.getTextMatchTexts(searchKeyword, url);
      const pinyinMatched =
        !!searchKeyword &&
        (indexItem.pinyinFull?.includes(searchKeyword) ||
          indexItem.pinyinInitials?.includes(searchKeyword));

      const match =
        titleMatchTexts.length > 0 ||
        codeMatchTexts.length > 0 ||
        urlMatchTexts.length > 0 ||
        pinyinMatched;

      if (match) {
        itemSearchKeywords.push(...titleMatchTexts, ...codeMatchTexts, ...urlMatchTexts);
        if (pinyinMatched && titleMatchTexts.length === 0) {
          itemSearchKeywords.push(item.title);
        }

        searchKeywords.push(...itemSearchKeywords);
        matchedMenus.push({
          ...item,
          searchKeywords: Array.from(new Set(itemSearchKeywords)),
        });
      }
    }

    return { menus: matchedMenus, searchKeywords: Array.from(new Set(searchKeywords)) };
  }

  private async searchMenusReturnTree(
    keyword: string,
    pinyinSearch = true
  ): Promise<MenuSearchTreeResult> {
    if (!keyword.trim()) return { menus: this.menus, expandKeys: [], searchKeywords: [] };
    const searchKeyword = keyword.toLowerCase().trim();
    const pinyin = pinyinSearch ? await loadPinyin() : null;

    const searchMenuItems = async (items: MenuItem[]) => {
      const expandKeys: string[] = [];
      const searchKeywords: string[] = [];

      const searchInMenu = async (menuItems: MenuItem[]): Promise<MenuItem[]> => {
        const matchedItems: MenuItem[] = [];

        for (const item of menuItems) {
          const titleMatchTexts = this.getTextMatchTexts(searchKeyword, item.title);
          const urlMatchTexts = this.getTextMatchTexts(searchKeyword, this.getMenuUrl(item));
          const pinyinMatchTexts = pinyin
            ? this.getPinyinMatchTexts(searchKeyword, item.title, pinyin)
            : [];
          const match =
            titleMatchTexts.length > 0 || urlMatchTexts.length > 0 || pinyinMatchTexts.length > 0;

          let matchedChildren: MenuItem[] = [];
          if (item.children && item.children.length > 0) {
            matchedChildren = await searchInMenu(item.children);
          }

          if (match || matchedChildren.length > 0) {
            if (matchedChildren.length > 0) {
              expandKeys.push(item.id);
            }

            matchedItems.push({
              ...item,
              children: matchedChildren.length > 0 ? matchedChildren : item.children,
            });

            searchKeywords.push(...titleMatchTexts, ...urlMatchTexts, ...pinyinMatchTexts);
          }
        }

        return matchedItems;
      };

      const matchedMenus = await searchInMenu(items);

      return {
        matchedMenus,
        expandKeys,
        searchKeywords: Array.from(new Set(searchKeywords)),
      };
    };

    const { matchedMenus, expandKeys, searchKeywords } = await searchMenuItems(this.menus);

    return { menus: matchedMenus, expandKeys, searchKeywords };
  }
  async searchMenus(keyword: string, pinyinSearch = true): Promise<MenuSearchResult> {
    const [menuList, menuTree] = await Promise.all([
      this.searchMenusReturnList(keyword, pinyinSearch),
      this.searchMenusReturnTree(keyword, pinyinSearch),
    ]);

    return {
      menuList,
      menuTree,
    };
  }

  async searchMenuList(keyword: string, pinyinSearch = true): Promise<MenuSearchListResult> {
    return this.searchMenusReturnList(keyword, pinyinSearch);
  }

  findFirstChildMenu(
    item: MenuItem,
    comparator?: (item: MenuItem) => MenuItem | null
  ): MenuItem | null {
    if (item.type === "menu" || !item.children || item.children.length === 0) {
      return item;
    }
    if (comparator) {
      return comparator(item);
    }
    return bfsSearch(item.children, (node) => {
      return node.type === "menu";
    });
  }
}
