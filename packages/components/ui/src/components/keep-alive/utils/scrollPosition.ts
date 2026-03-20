import type { ScrollPosition, ScrollNodePosition } from '../types';

export function saveScrollPosition(
  container: HTMLElement | null,
): ScrollNodePosition[] {
  if (!container) {
    return [];
  }

  const scrollNodes: ScrollNodePosition[] = [];
  const nodeList = container.querySelectorAll('*');

  nodeList.forEach((node) => {
    if (
      node instanceof HTMLElement &&
      (node.scrollWidth > node.clientWidth ||
        node.scrollHeight > node.clientHeight)
    ) {
      scrollNodes.push({
        node,
        position: { x: node.scrollLeft, y: node.scrollTop },
      });
    }
  });

  if (
    container.scrollWidth > container.clientWidth ||
    container.scrollHeight > container.clientHeight
  ) {
    scrollNodes.unshift({
      node: container,
      position: { x: container.scrollLeft, y: container.scrollTop },
    });
  }

  return scrollNodes;
}

export function restoreScrollPosition(
  scrollNodes: ScrollNodePosition[],
  delay: number = 0,
): void {
  if (!scrollNodes || scrollNodes.length === 0) {
    return;
  }

  const restore = () => {
    scrollNodes.forEach(({ node, position }) => {
      if (node instanceof HTMLElement) {
        node.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'instant',
        });
      }
    });
  };

  if (delay > 0) {
    setTimeout(restore, delay);
  } else {
    restore();
  }
}

export function clearScrollPosition(scrollNodes: ScrollNodePosition[]): void {
  if (!scrollNodes || scrollNodes.length === 0) {
    return;
  }

  scrollNodes.forEach(({ node }) => {
    if (node instanceof HTMLElement) {
      node.scrollTo({
        left: 0,
        top: 0,
        behavior: 'instant',
      });
    }
  });
}

export function scrollToPosition(
  container: HTMLElement | null,
  position: ScrollPosition,
): void {
  if (!container) {
    return;
  }

  container.scrollTo({
    left: position.x,
    top: position.y,
    behavior: 'instant',
  });
}

export function createScrollPositionManager() {
  const scrollPositionMap = new Map<string, ScrollNodePosition[]>();

  return {
    save: (key: string, positions: ScrollNodePosition[]): void => {
      scrollPositionMap.set(key, positions);
    },
    get: (key: string): ScrollNodePosition[] | undefined => {
      return scrollPositionMap.get(key);
    },
    remove: (key: string): void => {
      scrollPositionMap.delete(key);
    },
    clear: (): void => {
      scrollPositionMap.clear();
    },
    has: (key: string): boolean => {
      return scrollPositionMap.has(key);
    },
  };
}
