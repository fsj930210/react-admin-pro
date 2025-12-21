import { useState, useEffect } from "react";

export enum PanelState {
  NORMAL = "normal",
  MINIMIZED = "minimized",
  MAXIMIZED = "maximized",
  FULLSCREEN = "fullscreen",
}

export interface PanelControlsOptions {
  onClose?: () => void;
  onStateChange?: (state: PanelState) => void;
  useRequestFullScreen?: boolean;
  fullscreenElement?: HTMLElement;
}

export function usePanelControls(options: PanelControlsOptions) {
  const [panelState, setPanelState] = useState<PanelState>(PanelState.NORMAL);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMinimized = panelState === PanelState.MINIMIZED;
  const isMaximized =
    panelState === PanelState.MAXIMIZED || panelState === PanelState.FULLSCREEN;

  const changeState = (newState: PanelState) => {
    setPanelState(newState);
    options.onStateChange?.(newState);
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const newFullscreenState = !!document.fullscreenElement;
      setIsFullscreen(newFullscreenState);

      if (newFullscreenState) {
        changeState(PanelState.FULLSCREEN);
      } else if (panelState === PanelState.FULLSCREEN) {
        changeState(PanelState.NORMAL);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [panelState]);

  function handleMinimize() {
    if (isMaximized) {
      handleRestore();
      return;
    }
    changeState(PanelState.MINIMIZED);
  }

  async function handleMaximize() {
    if (isMinimized) {
      handleRestore();
      return;
    }

    if (options.useRequestFullScreen) {
      const element = options.fullscreenElement || document.documentElement;
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        }
      } catch (error) {
        console.warn("Failed to enter fullscreen mode:", error);
      }
    } else {
      changeState(PanelState.MAXIMIZED);
    }
  }

  function handleRestore() {
    changeState(PanelState.NORMAL);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(console.error);
    }
  }

  function handleClose() {
    options.onClose?.();
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
