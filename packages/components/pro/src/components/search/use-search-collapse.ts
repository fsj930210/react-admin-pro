import { useLayoutEffect, useRef, useState } from "react";

type SearchCollapseState = {
  canCollapse: boolean;
  collapsedHeight: number;
  expandedHeight: number;
  itemCount: number;
};

const initialState: SearchCollapseState = {
  canCollapse: false,
  collapsedHeight: 0,
  expandedHeight: 0,
  itemCount: 0,
};

function isSameState(prev: SearchCollapseState, next: SearchCollapseState) {
  return (
    prev.canCollapse === next.canCollapse &&
    Math.abs(prev.collapsedHeight - next.collapsedHeight) < 1 &&
    Math.abs(prev.expandedHeight - next.expandedHeight) < 1 &&
    prev.itemCount === next.itemCount
  );
}

function readRows(fieldsElement: HTMLElement) {
  const items = Array.from(fieldsElement.querySelectorAll<HTMLElement>("[data-search-item]"));
  const rows: Array<{ top: number; bottom: number }> = [];
  const fieldsRect = fieldsElement.getBoundingClientRect();

  for (const item of items) {
    if (item.offsetParent === null) continue;

    const itemRect = item.getBoundingClientRect();
    const top = itemRect.top - fieldsRect.top + fieldsElement.scrollTop;
    const bottom = itemRect.bottom - fieldsRect.top + fieldsElement.scrollTop;
    let row = rows.find((current) => Math.abs(current.top - top) < 2);

    if (!row) {
      row = { top, bottom };
      rows.push(row);
    }

    row.bottom = Math.max(row.bottom, bottom);
  }

  return rows.sort((a, b) => a.top - b.top);
}

export function useSearchCollapse({
  collapsedRows,
  enabled,
}: {
  collapsedRows: number;
  enabled: boolean;
}) {
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(initialState);

  // Layout measurement has to run after React commits because the browser is the source of truth
  // for row wrapping, custom item width, labels, and dependency-driven field visibility.
  useLayoutEffect(() => {
    const fieldsElement = fieldsRef.current;

    if (!fieldsElement || !enabled) {
      setState((prev) => (isSameState(prev, initialState) ? prev : initialState));
      return;
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rows = readRows(fieldsElement);
        const collapsedRow = rows[Math.max(collapsedRows, 1) - 1];
        const nextState = {
          canCollapse: rows.length > collapsedRows,
          collapsedHeight: collapsedRow?.bottom ?? fieldsElement.scrollHeight,
          expandedHeight: fieldsElement.scrollHeight,
          itemCount: fieldsElement.querySelectorAll("[data-search-item]").length,
        };

        setState((prev) => (isSameState(prev, nextState) ? prev : nextState));
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(fieldsElement);

    for (const item of fieldsElement.querySelectorAll("[data-search-item]")) {
      resizeObserver.observe(item);
    }

    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(fieldsElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [collapsedRows, enabled]);

  return {
    ...state,
    fieldsRef,
  };
}
