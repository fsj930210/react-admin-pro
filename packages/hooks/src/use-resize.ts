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

// 支持移动端的坐标获取方法
const getClientCoord = (
  e: MouseEvent | TouchEvent
): { clientX: number; clientY: number } => {
  if (e instanceof MouseEvent) {
    return { clientX: e.clientX, clientY: e.clientY };
  }
  const touch = e.touches[0] || e.changedTouches[0];
  return touch
    ? { clientX: touch.clientX, clientY: touch.clientY }
    : { clientX: 0, clientY: 0 };
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
	positionMode?: 'translate' | 'topLeft';
	disabled?: boolean;
	enableEdgeResize?: boolean; // 是否启用边和角resize
	edgeSize?: number; // 边和角的触发区域大小
}

// 缩放Hook
function useResize<T extends HTMLElement>(options?: ResizeOptions) {
  const resizeRef = useRef<T>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [size, setSize] = useState<Size | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [cursor, setCursor] = useState<string>('default');

  const optionsRef = useRef<ResizeOptions>({});
  optionsRef.current = options || {};
  
  const resizeStateRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    startSize: { width: 0, height: 0 } as Size,
    startPosition: { x: 0, y: 0 } as Position,
    lastSize: { width: 0, height: 0 } as Size,
    lastPosition: { x: 0, y: 0 } as Position,
    direction: undefined as ResizeDirection | undefined,
  });
  
  const rafIdRef = useRef<number | null>(null);

  const isDirectionAllowed = (dir: ResizeDirection): boolean => {
    const { directions } = optionsRef.current;
    if (!directions) return true;
    return directions.includes(dir);
  };

  // 检测鼠标位置确定resize方向和cursor
  const getResizeDirection = (x: number, y: number, rect: DOMRect): ResizeDirection | null => {
    const { enableEdgeResize = false, edgeSize = 8 } = optionsRef.current;
    
    if (!enableEdgeResize) return null;

    const { left, top, right, bottom } = rect;
    const isNearLeft = x - left < edgeSize;
    const isNearRight = right - x < edgeSize;
    const isNearTop = y - top < edgeSize;
    const isNearBottom = bottom - y < edgeSize;

    // 角落区域优先
    if (isNearTop && isNearLeft && isDirectionAllowed('nw')) return 'nw';
    if (isNearTop && isNearRight && isDirectionAllowed('ne')) return 'ne';
    if (isNearBottom && isNearLeft && isDirectionAllowed('sw')) return 'sw';
    if (isNearBottom && isNearRight && isDirectionAllowed('se')) return 'se';
    
    // 边缘区域
    if (isNearTop && isDirectionAllowed('n')) return 'n';
    if (isNearBottom && isDirectionAllowed('s')) return 's';
    if (isNearLeft && isDirectionAllowed('w')) return 'w';
    if (isNearRight && isDirectionAllowed('e')) return 'e';

    return null;
  };

  // 获取对应的cursor样式
  const getCursor = (direction: ResizeDirection | null): string => {
    switch (direction) {
      case 'n': return 'n-resize';
      case 's': return 's-resize';
      case 'w': return 'w-resize';
      case 'e': return 'e-resize';
      case 'nw': return 'nw-resize';
      case 'ne': return 'ne-resize';
      case 'sw': return 'sw-resize';
      case 'se': return 'se-resize';
      default: return 'default';
    }
  };

  // 处理边和角resize的鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeRef.current || isResizing) return;
    
    const { enableEdgeResize = false } = optionsRef.current;
    if (!enableEdgeResize) return;

    const rect = resizeRef.current.getBoundingClientRect();
    const direction = getResizeDirection(e.clientX, e.clientY, rect);
    
    const newCursor = getCursor(direction);
    if (cursor !== newCursor) {
      setCursor(newCursor);
    }
  };

  // 计算resize后的新尺寸和位置
  const calculateResize = (direction: ResizeDirection, dx: number, dy: number): { size: Size; position: Position } => {
    const { startSize, startPosition } = resizeStateRef.current;
    // const { positionMode } = optionsRef.current;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = startPosition.x;
    let newY = startPosition.y;

    switch (direction) {
      case 'e':
        newWidth = startSize.width + dx;
        break;
      case 'w':
        newWidth = startSize.width - dx;
        newX = startPosition.x + dx;
        break;
      case 'n':
        newHeight = startSize.height - dy;
        newY = startPosition.y + dy;
        break;
      case 's':
        newHeight = startSize.height + dy;
        break;
      case 'nw':
        newWidth = startSize.width - dx;
        newHeight = startSize.height - dy;
        newX = startPosition.x + dx;
        newY = startPosition.y + dy;
        break;
      case 'ne':
        newWidth = startSize.width + dx;
        newHeight = startSize.height - dy;
        newY = startPosition.y + dy;
        break;
      case 'sw':
        newWidth = startSize.width - dx;
        newHeight = startSize.height + dy;
        newX = startPosition.x + dx;
        break;
      case 'se':
        newWidth = startSize.width + dx;
        newHeight = startSize.height + dy;
        break;
    }

    return {
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY }
    };
  };

  // 处理缩放开始 - 支持鼠标和触摸事件
  const handleStart = (
    e: React.MouseEvent | React.TouchEvent, 
    direction: ResizeDirection
  ) => {
    if (!resizeRef.current) return;
    if (!isDirectionAllowed(direction)) return;
    
    const { disabled } = optionsRef.current;
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();

    const coord = getClientCoord(e.nativeEvent as MouseEvent | TouchEvent);
    
    // 获取当前元素的实际尺寸
    const rect = resizeRef.current.getBoundingClientRect();
    const currentSize = {
      width: rect.width,
      height: rect.height
    };
    
    // 检查是否已经达到边界
    const { maxSize, minSize } = optionsRef.current;
    const minWidth = minSize?.width ?? 50;
    const minHeight = minSize?.height ?? 50;
    const maxWidth = maxSize?.width ?? Infinity;
    const maxHeight = maxSize?.height ?? Infinity;
    
    // 如果已经在最小尺寸且还要缩小，或已经在最大尺寸且还要放大，则不允许开始resize
    if ((direction.includes('w') || direction.includes('e')) && 
        ((direction.includes('w') && currentSize.width <= minWidth) || 
         (direction.includes('e') && currentSize.width >= maxWidth))) {
      return;
    }
    
    if ((direction.includes('n') || direction.includes('s')) && 
        ((direction.includes('n') && currentSize.height <= minHeight) || 
         (direction.includes('s') && currentSize.height >= maxHeight))) {
      return;
    }

    // 获取当前位置
    const currentPosition = position || { x: 0, y: 0 };
    
    resizeStateRef.current = {
      isResizing: true,
      startX: coord.clientX,
      startY: coord.clientY,
      startSize: currentSize,
      startPosition: currentPosition,
      lastSize: currentSize,
      lastPosition: currentPosition,
      direction,
    };
    setIsResizing(true);
  };

  // 处理边和角resize的鼠标按下事件
  const handleMouseDown = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    
    const { enableEdgeResize = false, disabled } = optionsRef.current;
    if (!enableEdgeResize || disabled) return;

    const rect = resizeRef.current.getBoundingClientRect();
    const direction = getResizeDirection(e.clientX, e.clientY, rect);
    
    if (direction && isDirectionAllowed(direction)) {
      e.preventDefault();
      e.stopPropagation();
      
      // 检查边界条件
      const { maxSize, minSize } = optionsRef.current;
      const minWidth = minSize?.width ?? 50;
      const minHeight = minSize?.height ?? 50;
      const maxWidth = maxSize?.width ?? Infinity;
      const maxHeight = maxSize?.height ?? Infinity;
      
      const currentSize = {
        width: rect.width,
        height: rect.height
      };
      
      // 如果已经在边界，不允许开始resize
      if ((direction.includes('w') || direction.includes('e')) && 
          ((direction.includes('w') && currentSize.width <= minWidth) || 
           (direction.includes('e') && currentSize.width >= maxWidth))) {
        return;
      }
      
      if ((direction.includes('n') || direction.includes('s')) && 
          ((direction.includes('n') && currentSize.height <= minHeight) || 
           (direction.includes('s') && currentSize.height >= maxHeight))) {
        return;
      }
      
      // 获取当前位置
      const currentPosition = position || { x: 0, y: 0 };
      
      resizeStateRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        startSize: currentSize,
        startPosition: currentPosition,
        lastSize: currentSize,
        lastPosition: currentPosition,
        direction,
      };
      setIsResizing(true);
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
		if (!resizeStateRef.current.isResizing) return;
		
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const coord = getClientCoord(e);
      const dx = coord.clientX - resizeStateRef.current.startX;
      const dy = coord.clientY - resizeStateRef.current.startY;
      const direction = resizeStateRef.current.direction;

      const { maxSize, minSize, onResize } = optionsRef.current;
      
      // 设置默认最小值和最大值
      const minWidth = minSize?.width ?? 50;
      const minHeight = minSize?.height ?? 50;
      const maxWidth = maxSize?.width ?? Infinity;
      const maxHeight = maxSize?.height ?? Infinity;

      // 计算新的尺寸和位置
      const result = calculateResize(direction!, dx, dy);

      // 应用尺寸限制
      const newWidth = Math.min(maxWidth, Math.max(minWidth, result.size.width));
      const newHeight = Math.min(maxHeight, Math.max(minHeight, result.size.height));
      
      // 如果尺寸被限制了，需要重新计算位置
      let newPosition = result.position;
      if (newWidth !== result.size.width || newHeight !== result.size.height) {
        const widthDiff = newWidth - result.size.width;
        const heightDiff = newHeight - result.size.height;
        
        // 根据方向调整位置
        if (direction!.includes('w')) {
          newPosition.x = result.position.x + widthDiff;
        }
        if (direction!.includes('n')) {
          newPosition.y = result.position.y + heightDiff;
        }
      }

      const newSize = { width: newWidth, height: newHeight };
      
      // 更新状态
      resizeStateRef.current.lastSize = newSize;
      resizeStateRef.current.lastPosition = newPosition;
      
      setSize(newSize);
      setPosition(newPosition);

      // 如果提供了回调，则执行回调
      if (onResize) {
        onResize(newSize, newPosition);
      }
    });
  };

	const handleEnd = () => {
		resizeStateRef.current.isResizing = false;
    resizeStateRef.current.direction = undefined;
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
    setIsResizing(false);
	};

	const handleResize = (direction: ResizeDirection) => {
    return (e: React.MouseEvent | React.TouchEvent) => handleStart(e, direction);
  };

	const bindEvent = () => {
		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchmove', handleMove);
		document.addEventListener('touchend', handleEnd);
	}

	const removeEvent = () => {
		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', handleEnd);
		document.removeEventListener('touchmove', handleMove);
		document.removeEventListener('touchend', handleEnd);
		if (rafIdRef.current) {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = null;
		}
	}

	// 添加边和角resize的事件监听
	const bindEdgeResizeEvents = () => {
		if (resizeRef.current) {
			resizeRef.current.addEventListener('mousemove', handleMouseMove);
			resizeRef.current.addEventListener('mousedown', handleMouseDown);
		}
	}

	const removeEdgeResizeEvents = () => {
		if (resizeRef.current) {
			resizeRef.current.removeEventListener('mousemove', handleMouseMove);
			resizeRef.current.removeEventListener('mousedown', handleMouseDown);
		}
	}

	// 边和角resize的事件监听
	useEffect(() => {
		const { enableEdgeResize = false } = optionsRef.current;
		
		if (enableEdgeResize && resizeRef.current) {
			bindEdgeResizeEvents();
		}

		return () => {
			removeEdgeResizeEvents();
		};
	}, [resizeRef.current, optionsRef.current.enableEdgeResize]);

  useEffect(() => {
		if (isResizing) {
			bindEvent();
		} else {
			removeEvent()
		}
    return () => {
      removeEvent()
    };
  }, [isResizing]);

  return {
    resizeRef,
    handleResize,
    isResizing,
    size,
    position,
    cursor,
    bindEvent: () => {
      if (resizeRef.current) {
        bindEdgeResizeEvents();
      }
    },
    removeEvent: () => {
      removeEdgeResizeEvents();
    }
  };
}

export { useResize };
