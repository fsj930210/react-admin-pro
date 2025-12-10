import { useCallback, useEffect, useRef, useState } from "react";

// 定义方向类型
export type Direction = 'n' | 's' | 'w' | 'e' | 'nw' | 'ne' | 'sw' | 'se';

// 定义缩放Hook的返回类型
interface ResizableHook {
  ref: React.RefObject<HTMLDivElement | null>;
  handleResize: (direction: Direction) => (e: React.MouseEvent) => void;
  isResizing: boolean;
}

// 缩放Hook
export function useReSize(
  size: { width: number; height: number },
  setSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>,
  position: { x: number; y: number },
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  minSize: { width: number; height: number },
  maxSize: { width: number; height: number },
  resizableDirections: Direction[]
): ResizableHook {
  const ref = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const elementStartSize = useRef({ width: 0, height: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const resizeDirection = useRef<Direction | null>(null);

  // 检查方向是否允许缩放
  const isDirectionAllowed = useCallback((dir: Direction) => {
    return resizableDirections.includes(dir);
  }, [resizableDirections]);

  // 处理缩放开始
  const startResize = useCallback((e: React.MouseEvent, direction: Direction) => {
    if (!isDirectionAllowed(direction)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartSize.current = { ...size };
    elementStartPos.current = { ...position };
    resizeDirection.current = direction;
    
    setIsResizing(true);
  }, [isDirectionAllowed, size, position]);

  // 为每个方向创建处理函数
  const handleResize = useCallback((direction: Direction) => {
    return (e: React.MouseEvent) => startResize(e, direction);
  }, [startResize]);

  // 处理鼠标移动事件，更新组件尺寸和位置
  useEffect(() => {
    if (!isResizing || !resizeDirection.current || !ref.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartPos.current.x;
      const dy = e.clientY - resizeStartPos.current.y;
      
      let newWidth = elementStartSize.current.width;
      let newHeight = elementStartSize.current.height;
      let newX = elementStartPos.current.x;
      let newY = elementStartPos.current.y;
      
      const direction = resizeDirection.current!;
      
      // 根据方向调整尺寸和位置
      switch (direction) {
        case 'e':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width + dx));
          break;
        case 'w':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width - dx));
          newX = elementStartPos.current.x + dx;
          break;
        case 'n':
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height - dy));
          newY = elementStartPos.current.y + dy;
          break;
        case 's':
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height + dy));
          break;
        case 'nw':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width - dx));
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height - dy));
          newX = elementStartPos.current.x + dx;
          newY = elementStartPos.current.y + dy;
          break;
        case 'ne':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width + dx));
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height - dy));
          newY = elementStartPos.current.y + dy;
          break;
        case 'sw':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width - dx));
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height + dy));
          newX = elementStartPos.current.x + dx;
          break;
        case 'se':
          newWidth = Math.min(maxSize.width, Math.max(minSize.width, elementStartSize.current.width + dx));
          newHeight = Math.min(maxSize.height, Math.max(minSize.height, elementStartSize.current.height + dy));
          break;
      }
      
      // 更新尺寸和位置
      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeDirection.current = null;
    };

    // 添加全局事件监听器
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isResizing, minSize, maxSize, setSize, setPosition]);

  return { ref, handleResize, isResizing };
}
