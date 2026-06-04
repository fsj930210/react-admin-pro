import { bfsSearch, traverseTree } from "@rap/utils";
import type { FlatMenuItem, MenuItem } from "../types";
import type { pinyin as pinyinFunction } from "pinyin-pro";

type Pinyin = typeof pinyinFunction;

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

let pinyinLoader: Promise<Pinyin> | null = null;

function loadPinyin(): Promise<Pinyin> {
  pinyinLoader ??= import("pinyin-pro").then((module) => module.pinyin);
  return pinyinLoader;
}

export class MenuService {
  menus: MenuItem[];
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
    return this.flattenMenus(this.menus);
  }
  findMenuById(menuId: string): MenuItem | null {
    return this.flatMenus.find((item) => item.id === menuId) ?? null;
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

  private getPinyinMatchTexts(
    searchKeyword: string,
    sourceText: string,
    pinyin: Pinyin
  ): string[] {
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
      if (currPy === key && char && !matchTexts.includes(char)) {
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
        let currChar = "";
        for (let j = i; j < pyArr.length; j++) {
          currPy += pyArr[j];
          currChar += charArr[j];
          if (currPy === key) {
            if (!matchTexts.includes(currChar)) {
              matchTexts.push(currChar);
            }
            break;
          }
          if (currPy.length > keyLen) break;
        }
      }
    }
    return [...new Set(matchTexts)].filter(Boolean);
  }

  private async searchMenusReturnList(
    keyword: string,
    pinyinSearch = true
  ): Promise<MenuSearchListResult> {
    if (!keyword.trim()) return { menus: this.flatMenus, searchKeywords: [] };

    const searchKeyword = keyword.toLowerCase().trim();
    const searchKeywords: string[] = [];
    const matchedMenus: FlatMenuItem[] = [];
    const pinyin = pinyinSearch ? await loadPinyin() : null;

    for (const item of this.flatMenus) {
      const titleMatchTexts = this.getTextMatchTexts(searchKeyword, item.title);
      const codeMatchTexts = this.getTextMatchTexts(searchKeyword, item.code);
      const pinyinMatchTexts = pinyin
        ? this.getPinyinMatchTexts(searchKeyword, item.title, pinyin)
        : [];

      const match =
        titleMatchTexts.length > 0 || codeMatchTexts.length > 0 || pinyinMatchTexts.length > 0;

      if (match) {
        searchKeywords.push(...titleMatchTexts, ...codeMatchTexts, ...pinyinMatchTexts);
        matchedMenus.push(item);
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
          const pinyinMatchTexts = pinyin
            ? this.getPinyinMatchTexts(searchKeyword, item.title, pinyin)
            : [];
          const match = titleMatchTexts.length > 0 || pinyinMatchTexts.length > 0;

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

            searchKeywords.push(...titleMatchTexts, ...pinyinMatchTexts);
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
