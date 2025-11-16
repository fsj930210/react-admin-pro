import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTabsScrollOptions {
  scrollStep?: number;
}

export function useTabsScroll(options: UseTabsScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const SCROLL_STEP = options.scrollStep ?? 200;

  // 检查是否可以滚动
  const checkScrollability = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasScrollbar = scrollWidth > clientWidth;
    setCanScrollLeft(hasScrollbar && scrollLeft > 0);
    // 修复：增加容错值，确保可以滚动到最右边界
    setCanScrollRight(
      hasScrollbar && scrollLeft < scrollWidth - clientWidth - 20
    );
  }, []);

  // 处理鼠标滚轮事件
  const handleWheel = useCallback((event: React.WheelEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollWidth <= container.clientWidth) return;

    container.scrollTo({
      left: container.scrollLeft + event.deltaY,
      behavior: "smooth",
    });
  }, []);

  // 移动端触摸滑动支持
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 处理触摸事件
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      setStartX(event.touches[0].pageX - container.offsetLeft);
      setScrollLeft(container.scrollLeft);
    },
    []
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const x = event.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;

      container.scrollLeft = scrollLeft - walk;
    },
    [startX, scrollLeft]
  );

  // 向前滚动
  const scrollToLeft = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.scrollLeft - SCROLL_STEP,
      behavior: "smooth",
    });
  }, [SCROLL_STEP]);

  // 向后滚动
  const scrollRight = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      left: container.scrollLeft + SCROLL_STEP,
      behavior: "smooth",
    });
  }, [SCROLL_STEP]);

  // 滚动到指定的tab
  const scrollToTab = useCallback(
    (tabKey: string) => {
      const tabElement = document.querySelector(`[data-tab-key="${tabKey}"]`);
      const container = containerRef.current;

      if (!tabElement || !container) return;

      const containerRect = container.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();

      // 判断tab是否完全在可视区域内
      const isFullyVisible =
        tabRect.left >= containerRect.left &&
        tabRect.right <= containerRect.right;

      // 判断tab是否部分在可视区域内
      const isPartiallyVisible =
        tabRect.left < containerRect.right &&
        tabRect.right > containerRect.left;

      if (isFullyVisible) {
        // 如果完全可见，不滚动
        return;
      } else if (isPartiallyVisible) {
        // 如果部分可见，滚动到让它完全可见
        if (tabRect.left < containerRect.left) {
          // tab左侧超出容器，向左滚动
          container.scrollTo({
            left: container.scrollLeft + (tabRect.left - containerRect.left),
            behavior: "smooth",
          });
        } else {
          // tab右侧超出容器，向右滚动
          container.scrollTo({
            left: container.scrollLeft + (tabRect.right - containerRect.right),
            behavior: "smooth",
          });
        }
      } else {
        // 如果完全不可见，滚动到中间
        tabElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }

      requestAnimationFrame(() => {
        checkScrollability();
      });
    },
    [checkScrollability]
  );

  // 监听滚动事件
  const handleScroll = useCallback(() => {
    checkScrollability();
  }, [checkScrollability]);

  // 使用ResizeObserver监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollability();

    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollability]);

  return {
    containerRef,
    tabsRef,
    canScrollLeft,
    canScrollRight,
    handleWheel,
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    scrollToLeft,
    scrollRight,
    scrollToTab,
  };
}
