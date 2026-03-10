import { useState, useEffect } from "react";

export enum MinimaxState {
  NORMAL = "normal",
  MINIMIZED = "minimized",
  MAXIMIZED = "maximized",
  FULLSCREEN = "fullscreen",
}

export interface MinimaxOptions {
  onClose?: () => void;
  onStateChange?: (state: MinimaxState) => void;
  useRequestFullScreen?: boolean;
  fullscreenElement?: HTMLElement;
}

export function useMinimax(options?: MinimaxOptions) {
  const [minimax, setMinimax] = useState<MinimaxState>(MinimaxState.NORMAL);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMinimized = minimax === MinimaxState.MINIMIZED;
  const isMaximized =
    minimax === MinimaxState.MAXIMIZED || minimax === MinimaxState.FULLSCREEN;

  const changeState = (newState: MinimaxState) => {
    setMinimax(newState);
    options?.onStateChange?.(newState);
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newFullscreenState = !!document.fullscreenElement;
      setIsFullscreen(newFullscreenState);

      if (newFullscreenState) {
        changeState(MinimaxState.FULLSCREEN);
      } else if (minimax === MinimaxState.FULLSCREEN) {
        changeState(MinimaxState.NORMAL);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function handleMinimize() {
    if (isMaximized) {
      handleRestore();
      return;
    }
    changeState(MinimaxState.MINIMIZED);
  }

  async function handleMaximize() {
    if (isMinimized) {
      handleRestore();
      return;
    }

    if (options?.useRequestFullScreen) {
      const element = options?.fullscreenElement || document.documentElement;
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        }
      } catch (error) {
        console.warn("Failed to enter fullscreen mode:", error);
      }
    } else {
      changeState(MinimaxState.MAXIMIZED);
    }
  }

  function handleRestore() {
    changeState(MinimaxState.NORMAL);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(console.error);
    }
  }

  function handleClose() {
    options?.onClose?.();
  }

  return {
    isMinimized,
    isMaximized,
    isFullscreen,
    handleMinimize,
    handleMaximize,
    handleRestore,
    handleClose,
  };
}
