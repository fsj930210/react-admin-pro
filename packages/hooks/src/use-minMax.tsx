import { useCallback, useMemo, useRef, useState } from "react";

// 定义最小化位置类型
export type MinimizePosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

// 定义最小化、最大化、关闭Hook的返回类型
export interface MinMaxCloseHook {
  isMinimized: boolean;
  isMaximized: boolean;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
  handleClose: () => void;
  minimizedPosition: { x: number; y: number };
}

// 最小化、最大化、关闭Hook
export function useMinMaxClose (
  position: { x: number; y: number },
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  size: { width: number; height: number },
  setSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>,
  minimizePosition: MinimizePosition,
  minimizedWidth: number,
  minimizedHeight: number,
  maxSize?: { width: number; height: number },
  onClose?: () => void
): MinMaxCloseHook {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // 记录原始位置和尺寸
  const originalPosition = useRef({ x: 0, y: 0 });
  const originalSize = useRef({ width: 0, height: 0 });

  // 计算最小化后的位置
  const minimizedPosition = useMemo(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    switch (minimizePosition) {
      case 'bottom-right':
        return { 
          x: window.innerWidth - minimizedWidth - 20, 
          y: window.innerHeight - minimizedHeight - 20 
        };
      case 'bottom-left':
        return { 
          x: 20, 
          y: window.innerHeight - minimizedHeight - 20 
        };
      case 'top-right':
        return { 
          x: window.innerWidth - minimizedWidth - 20, 
          y: 20 
        };
      case 'top-left':
        return { 
          x: 20, 
          y: 20 
        };
      default:
        return { x: 0, y: 0 };
    }
  }, [minimizePosition, minimizedWidth, minimizedHeight]);

  // 切换最小化状态
  const toggleMinimize = useCallback(() => {
    if (isMinimized) {
      // 恢复到原始位置和尺寸
      setPosition({ ...originalPosition.current });
      setSize({ ...originalSize.current });
      setIsMinimized(false);
    } else {
      // 如果当前是最大化状态，先退出最大化
      if (isMaximized) {
        setIsMaximized(false);
      }
      
      // 保存当前位置和尺寸
      originalPosition.current = { ...position };
      originalSize.current = { ...size };
      
      // 设置最小化后的位置和尺寸
      setPosition({ ...minimizedPosition });
      setSize({ width: minimizedWidth, height: minimizedHeight });
      setIsMinimized(true);
    }
  }, [isMinimized, isMaximized, position, size, setPosition, setSize, minimizedPosition, minimizedWidth, minimizedHeight]);

  // 切换最大化状态
  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      // 恢复到原始位置和尺寸
      setPosition({ ...originalPosition.current });
      setSize({ ...originalSize.current });
      setIsMaximized(false);
    } else {
      // 如果当前是最小化状态，先退出最小化
      if (isMinimized) {
        setIsMinimized(false);
      }
      
      // 保存当前位置和尺寸
      originalPosition.current = { ...position };
      originalSize.current = { ...size };
      
      // 设置最大化后的位置和尺寸
      setPosition({ x: 0, y: 0 });
      
      // 如果有指定最大尺寸，使用指定尺寸，否则全屏
      if (maxSize) {
        setSize(maxSize);
      } else {
        // 全屏
        setSize({ 
          width: typeof window !== 'undefined' ? window.innerWidth : 800, 
          height: typeof window !== 'undefined' ? window.innerHeight : 600 
        });
      }
      
      setIsMaximized(true);
    }
  }, [isMaximized, isMinimized, position, size, setPosition, setSize, maxSize]);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return {
    isMinimized,
    isMaximized,
    toggleMinimize,
    toggleMaximize,
    handleClose,
    minimizedPosition
  };
}
