import type { ScrollSnapshot } from "./types";

const SCROLL_ID_ATTRIBUTE = "data-keep-alive-scroll-id";

function readScrollPoint(element: HTMLElement) {
  return {
    left: element.scrollLeft,
    top: element.scrollTop,
  };
}

export function saveScrollSnapshot(container: HTMLElement | null): ScrollSnapshot | undefined {
  if (!container) return undefined;

  const nodes: ScrollSnapshot["nodes"] = {};
  const scrollNodes = container.querySelectorAll<HTMLElement>(`[${SCROLL_ID_ATTRIBUTE}]`);

  scrollNodes.forEach((node) => {
    const id = node.getAttribute(SCROLL_ID_ATTRIBUTE);
    if (!id) return;
    nodes[id] = readScrollPoint(node);
  });

  return {
    container: readScrollPoint(container),
    nodes,
  };
}

export function restoreScrollSnapshot(
  container: HTMLElement | null,
  snapshot: ScrollSnapshot | undefined
) {
  if (!container || !snapshot) return;

  requestAnimationFrame(() => {
    container.scrollTo({
      left: snapshot.container.left,
      top: snapshot.container.top,
      behavior: "instant",
    });

    Object.entries(snapshot.nodes).forEach(([id, point]) => {
      const node = container.querySelector<HTMLElement>(
        `[${SCROLL_ID_ATTRIBUTE}="${CSS.escape(id)}"]`
      );
      node?.scrollTo({
        left: point.left,
        top: point.top,
        behavior: "instant",
      });
    });
  });
}
