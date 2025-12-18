import { useState, useRef, useEffect } from "react";

// 定义方向类型
export type ResizeDirection = 'n' | 's' | 'w' | 'e' | 'nw' | 'ne' | 'sw' | 'se';

export const Direction = {
  N: 'n' as const,
  S: 's' as const,
  W: 'w' as const,
  E: 'e' as const,
  NW: 'nw' as const,
  NE: 'ne' as const,
  SW: 'sw' as const,
  SE: 'se' as const
};

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

export interface ResizeOptions {
  minSize?: Partial<Size>;
  maxSize?: Partial<Size>;
  directions?: ResizeDirection[];
  onResize?: (size: Size, position: Position) => void;
}

// 缩放Hook
function useResize<T extends HTMLElement>(options?: ResizeOptions) {
  const ref = useRef<T>(null);
  const [isResizing, _setIsResizing] = useState<boolean>(false);
  const [size, setSize] = useState<Size | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const optionsRef = useRef<ResizeOptions>({});
  optionsRef.current = options || {};
	const isResizingRef = useRef(false);
  const resizeStartPos = useRef<Position | null>(null);
  const elStartSize = useRef<Size | null>(null);
  const elStartPos = useRef<Position | null>(null);
  const resizeDirection = useRef<ResizeDirection | null>(null);
  const rafIdRef = useRef<number | null>(null);

	const setIsResizing =(resizing: boolean) => {
		_setIsResizing(resizing);
		isResizingRef.current = resizing;
	}
  const initResize = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const containerRect = ref.current.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
      const relativeX = rect.left - containerRect.left;
      const relativeY = rect.top - containerRect.top;

      const initialSize: Size = {
        width: rect.width,
        height: rect.height
      };

      const initialPosition: Position = {
        x: relativeX,
        y: relativeY
      };

      setSize(initialSize);
      setPosition(initialPosition);

      elStartSize.current = initialSize;
      elStartPos.current = initialPosition;
    }
  };

  const isDirectionAllowed = (dir: ResizeDirection): boolean => {
    const { directions } = optionsRef.current;
    if (!directions) return true;
    return directions.includes(dir);
  };

	  // 处理缩放开始
  const handleMouseStart = (e: React.MouseEvent, direction: ResizeDirection) => {
    if (!ref.current) return;
    if (!isDirectionAllowed(direction)) return;

    e.preventDefault();
    e.stopPropagation();

    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    elStartSize.current = size ? {...size} : null;
    elStartPos.current = position ? {...position} : null;
    resizeDirection.current = direction;

    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
		console.log(isResizingRef.current)
		if (!isResizingRef.current) return;
		
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (!resizeStartPos.current || !resizeDirection.current || !elStartSize.current) return;
      
      const dx = e.clientX - resizeStartPos.current.x;
      const dy = e.clientY - resizeStartPos.current.y;

      const { maxSize, minSize, onResize } = optionsRef.current;
      
      let newWidth = elStartSize.current.width;
      let newHeight = elStartSize.current.height;
      let newX = elStartPos.current?.x || 0;
      let newY = elStartPos.current?.y || 0;

      const direction = resizeDirection.current;
      
      // 设置默认最小值和最大值
      const minWidth = minSize?.width ?? 50;
      const minHeight = minSize?.height ?? 50;
      const maxWidth = maxSize?.width ?? Infinity;
      const maxHeight = maxSize?.height ?? Infinity;

      switch (direction) {
        case 'e':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width + dx));
          break;
        case 'w':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width - dx));
          newX = (elStartPos.current?.x || 0) + dx;
          break;
        case 'n':
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height - dy));
          newY = (elStartPos.current?.y || 0) + dy;
          break;
        case 's':
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height + dy));
          break;
        case 'nw':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width - dx));
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height - dy));
          newX = (elStartPos.current?.x || 0) + dx;
          newY = (elStartPos.current?.y || 0) + dy;
          break;
        case 'ne':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width + dx));
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height - dy));
          newY = (elStartPos.current?.y || 0) + dy;
          break;
        case 'sw':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width - dx));
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height + dy));
          newX = (elStartPos.current?.x || 0) + dx;
          break;
        case 'se':
          newWidth = Math.min(maxWidth, Math.max(minWidth, elStartSize.current.width + dx));
          newHeight = Math.min(maxHeight, Math.max(minHeight, elStartSize.current.height + dy));
          break;
      }

      // 更新本地状态
      const newSize = { width: newWidth, height: newHeight };
      const newPosition = { x: newX, y: newY };
      
      setSize(newSize);
      setPosition(newPosition);

      // 如果提供了回调，则执行回调
      if (onResize) {
        onResize(newSize, newPosition);
      }
    });
  };

	const handleMouseUp = () => {
		setIsResizing(false);
		resizeDirection.current = null;
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
	};

	const handleResize = (direction: ResizeDirection) => {
    return (e: React.MouseEvent) => handleMouseStart(e, direction);
  };
	useEffect(() => {
		initResize();
	}, [])
  useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		} else {
			document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
			if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
		}
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isResizing]);

  return {
    ref,
    handleResize,
    isResizing,
    size,
    position
  };
}

export { useResize };