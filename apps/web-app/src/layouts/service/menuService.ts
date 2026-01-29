import { pinyin } from "pinyin-pro";
import { dfsSearch, traverseTree } from "@rap/utils";
import type { FlatMenuItem, MenuItem } from "../types";

export class MenuService {
	menus: MenuItem[];
	constructor(menus: MenuItem[]) {
		this.menus = menus;
	}
	private flattenMenus (menuList: MenuItem[] = []): FlatMenuItem[] {
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
	};
	
	get flatMenus() {
		return this.flattenMenus(this.menus)
	}
	findMenuById (menuId: string): MenuItem | null  {
		return this.flatMenus.find(item => item.id === menuId) ?? null;
	};
	
	findMenuByUrl  (url: string): MenuItem | null  {
		const normalizeUrl  = (url: string) => {
			return url.split('?')[0].split('#')[0].replace(/\/$/, '');
		};
		const targetUrl = normalizeUrl(url);
		return this.flatMenus.find(menu => normalizeUrl(menu.url ?? '') === targetUrl) ?? null;
	};
	
	findMenuAncestor (menuId: string): MenuItem[]  {
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
	};
	private getTextMatchTexts (searchKeyword: string, sourceText: string) {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const textLower = sourceText.toLowerCase();
    const keyLen = key.length;
    let start = 0;
    while ((start = textLower.indexOf(key, start)) > -1) {
      const realText = sourceText.substring(start, start + keyLen);
      if (!matchTexts.includes(realText)) {
        matchTexts.push(realText);
      }
      start += keyLen;
    }
    return matchTexts;
  };

  private getPinyinMatchTexts  (searchKeyword: string, sourceText: string)  {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const keyLen = key.length;
    const pyArr = pinyin(sourceText, { type: 'array', toneType: 'none', v: true });
    const charArr = sourceText.split('');
    const yunMuWhiteList = ['an','ang','ong','eng','ing','ian','iao','uan','uang','uen','uei','iong'];
    const isOnlyYunMu = yunMuWhiteList.includes(key);
    charArr.forEach((char, idx) => {
      const currPy = pyArr[idx] ?? '';
      if (currPy === key && char && !matchTexts.includes(char)) {
        matchTexts.push(char);
      }
    });
    if (isOnlyYunMu && matchTexts.length === 0) {
      charArr.forEach((char, idx) => {
        const currPy = pyArr[idx] || '';
        if (currPy === key && char) matchTexts.push(char);
      });
    }

    if (keyLen > 1 && !isOnlyYunMu && matchTexts.length === 0) {
      for (let i = 0; i < pyArr.length; i++) {
        let currPy = '';
        let currChar = '';
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
  };

  private searchMenusReturnList (keyword: string, pinyinSearch = true)  {
    if (!keyword.trim()) return { menus: this.flatMenus, searchKeywords: [] };

    const searchKeyword = keyword.toLowerCase().trim();
    const searchKeywords: string[] = [];

    const matchedMenus = this.flatMenus.filter(item => {
      const titleMatchTexts = this.getTextMatchTexts(searchKeyword, item.title);
      const codeMatchTexts = this.getTextMatchTexts(searchKeyword, item.code);
      const pinyinMatchTexts = pinyinSearch ? this.getPinyinMatchTexts(searchKeyword, item.title) : [];
      
      const match = titleMatchTexts.length > 0 || codeMatchTexts.length > 0 || pinyinMatchTexts.length > 0;
      
      if (match) {
        searchKeywords.push(...titleMatchTexts, ...codeMatchTexts, ...pinyinMatchTexts);
      }
      
      return match;
    });
    
    return { menus: matchedMenus, searchKeywords: Array.from(new Set(searchKeywords)) };
  };

  private searchMenusReturnTree  (keyword: string, pinyinSearch = true)  {
    if (!keyword.trim()) return { menus: this.menus, expandKeys: [], searchKeywords: [] };
    const searchKeyword = keyword.toLowerCase().trim();
    
    const searchMenuItems = (items: MenuItem[]) => {
      const expandKeys: string[] = [];
      const searchKeywords: string[] = [];

      const searchInMenu = (menuItems: MenuItem[]): MenuItem[] => {
        const matchedItems: MenuItem[] = [];

        for (const item of menuItems) {
          const titleMatchTexts = this.getTextMatchTexts(searchKeyword, item.title);
          const pinyinMatchTexts = pinyinSearch ? this.getPinyinMatchTexts(searchKeyword, item.title) : [];
          const match = titleMatchTexts.length > 0 || pinyinMatchTexts.length > 0;

          let matchedChildren: MenuItem[] = [];
          if (item.children && item.children.length > 0) {
            matchedChildren = searchInMenu(item.children);
          }

          if (match || matchedChildren.length > 0) {
            if (matchedChildren.length > 0) {
              expandKeys.push(item.id);
            }
            
            matchedItems.push({
              ...item,
              children: matchedChildren.length > 0 ? matchedChildren : item.children
            });
            
            searchKeywords.push(...titleMatchTexts, ...pinyinMatchTexts);
          }
        }

        return matchedItems;
      };

      const matchedMenus = searchInMenu(items);
      
      return {
        matchedMenus,
        expandKeys,
        searchKeywords: Array.from(new Set(searchKeywords))
      };
    };
    
    const { matchedMenus, expandKeys, searchKeywords } = searchMenuItems(this.menus);

    return { menus: matchedMenus, expandKeys, searchKeywords };
  };
	searchMenus(keyword: string, pinyinSearch = true) {
		return {
			menuList: this.searchMenusReturnList(keyword, pinyinSearch),
			menuTree: this.searchMenusReturnTree(keyword, pinyinSearch)
		}
	}

	findFirstChildMenu(item: MenuItem): MenuItem | null {
		if (!item.children || item.children.length === 0) {
			return null;
		}
		return dfsSearch(item.children, (child) => {
			return child.type === 'menu';
		});
	}
}
