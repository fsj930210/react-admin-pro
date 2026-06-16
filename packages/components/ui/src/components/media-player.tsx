// 鏂囨。鍦板潃 https://www.diceui.com/docs/components/radix/media-player
"use client";

import {
  AlertTriangle,
  CaptionsOff,
  Check,
  Download,
  FastForward,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
  PictureInPicture,
  Play,
  RefreshCcw,
  Repeat,
  Rewind,
  RotateCcw,
  Settings,
  Subtitles,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  MediaActionTypes,
  MediaProvider,
  timeUtils,
  useMediaDispatch,
  useMediaFullscreenRef,
  useMediaRef,
  useMediaSelector,
} from "media-chrome/react/media-store";
import {
  Direction as DirectionPrimitive,
  Slider as SliderPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import {
  createContext,
  createElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ComponentProps,
  type ComponentRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useComposedRefs } from "@rap/utils/compose-refs";
import { cn } from "@rap/utils";
import { useLazyRef } from "@rap/hooks/use-lazy-ref";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { createPortal } from "react-dom";

const ROOT_NAME = "MediaPlayer";
const SEEK_NAME = "MediaPlayerSeek";
const SETTINGS_NAME = "MediaPlayerSettings";
const VOLUME_NAME = "MediaPlayerVolume";
const PLAYBACK_SPEED_NAME = "MediaPlayerPlaybackSpeed";

const FLOATING_MENU_SIDE_OFFSET = 10;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SEEK_STEP_SHORT = 5;
const SEEK_STEP_LONG = 10;
const SEEK_COLLISION_PADDING = 10;
const SEEK_TOOLTIP_WIDTH_FALLBACK = 240;

const SEEK_HOVER_PERCENT = "--seek-hover-percent";
const SEEK_TOOLTIP_X = "--seek-tooltip-x";
const SEEK_TOOLTIP_Y = "--seek-tooltip-y";

const SPRITE_CONTAINER_WIDTH = 224;
const SPRITE_CONTAINER_HEIGHT = 128;

const ERROR_LABEL_MAP: Record<number, string> = {
  [MediaError.MEDIA_ERR_ABORTED]: "Playback Interrupted",
  [MediaError.MEDIA_ERR_NETWORK]: "Connection Problem",
  [MediaError.MEDIA_ERR_DECODE]: "Media Error",
  [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: "Unsupported Format",
};

const ERROR_DESCRIPTION_MAP: Record<number, string> = {
  [MediaError.MEDIA_ERR_ABORTED]: "Media playback was aborted",
  [MediaError.MEDIA_ERR_NETWORK]: "A network error occurred while loading the media",
  [MediaError.MEDIA_ERR_DECODE]: "An error occurred while decoding the media",
  [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: "The media format is not supported",
};

function getErrorLabel(label: ReactNode | undefined, error: MediaError | undefined) {
  if (label) return label;
  if (!error) return "Playback Error";
  return ERROR_LABEL_MAP[error.code] ?? "Playback Error";
}

function getErrorDescription(description: ReactNode | undefined, error: MediaError | undefined) {
  if (description) return description;
  if (!error) return "An unknown error occurred";
  return ERROR_DESCRIPTION_MAP[error.code] ?? "An unknown error occurred";
}

function getBufferedProgress({
  mediaBuffered,
  mediaCurrentTime,
  seekableEnd,
  mediaEnded,
  seekableStart,
}: {
  mediaBuffered: [number, number][];
  mediaCurrentTime: number;
  seekableEnd: number;
  mediaEnded: boolean;
  seekableStart: number;
}) {
  if (mediaBuffered.length === 0 || seekableEnd <= 0) return 0;
  if (mediaEnded) return 1;

  const containingRange = mediaBuffered.find(
    ([start, end]) => start <= mediaCurrentTime && mediaCurrentTime <= end
  );

  if (containingRange) {
    return Math.min(1, containingRange[1] / seekableEnd);
  }

  return Math.min(1, seekableStart / seekableEnd);
}

function getSpriteStyle(
  thumbnail: { coords?: string[] | null; src?: string } | null
): CSSProperties {
  if (!thumbnail?.coords || !thumbnail?.src) {
    return {};
  }

  const coordX = thumbnail.coords[0];
  const coordY = thumbnail.coords[1];
  const spriteWidth = Number.parseFloat(thumbnail.coords[2] ?? "0");
  const spriteHeight = Number.parseFloat(thumbnail.coords[3] ?? "0");
  const scaleX = spriteWidth > 0 ? SPRITE_CONTAINER_WIDTH / spriteWidth : 1;
  const scaleY = spriteHeight > 0 ? SPRITE_CONTAINER_HEIGHT / spriteHeight : 1;
  const scale = Math.min(scaleX, scaleY);

  return {
    width: `${spriteWidth}px`,
    height: `${spriteHeight}px`,
    backgroundImage: `url(${thumbnail.src})`,
    backgroundPosition: `-${coordX}px -${coordY}px`,
    backgroundRepeat: "no-repeat",
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };
}

function getMediaTimes({
  variant,
  mediaCurrentTime,
  seekableEnd,
}: {
  variant: "progress" | "remaining" | "duration";
  mediaCurrentTime: number;
  seekableEnd: number;
}) {
  if (variant === "remaining") {
    return {
      remaining: timeUtils.formatTime(seekableEnd - mediaCurrentTime, seekableEnd),
    };
  }

  if (variant === "duration") {
    return {
      duration: timeUtils.formatTime(seekableEnd, seekableEnd),
    };
  }

  return {
    current: timeUtils.formatTime(mediaCurrentTime, seekableEnd),
    duration: timeUtils.formatTime(seekableEnd, seekableEnd),
  };
}

function getSelectedSubtitleLabel(
  isSubtitlesActive: boolean,
  mediaSubtitlesShowing: { label?: string }[]
) {
  if (!isSubtitlesActive) return "Off";
  if (mediaSubtitlesShowing.length > 0) {
    return mediaSubtitlesShowing[0]?.label ?? "On";
  }
  return "Off";
}

function getSelectedRenditionLabel(
  selectedRenditionId: string | undefined,
  mediaRenditionList: { id?: string; height?: number; width?: number }[]
) {
  if (!selectedRenditionId) return "Auto";

  const currentRendition = mediaRenditionList.find(
    (rendition) => rendition.id === selectedRenditionId
  );
  if (!currentRendition) return "Auto";

  if (currentRendition.height) return `${currentRendition.height}p`;
  if (currentRendition.width) return `${currentRendition.width}p`;
  return currentRendition.id ?? "Auto";
}

interface DivProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = ComponentRef<typeof MediaPlayer>;

type Direction = "ltr" | "rtl";

interface StoreState {
  controlsVisible: boolean;
  dragging: boolean;
  menuOpen: boolean;
  volumeIndicatorVisible: boolean;
}

interface Store {
  subscribe: (cb: () => void) => () => void;
  getState: () => StoreState;
  setState: (key: keyof StoreState, value: StoreState[keyof StoreState]) => void;
  notify: () => void;
}

const StoreContext = createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = use(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = useMemoizedFn(() => selector(store.getState()));

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface MediaPlayerContextValue {
  mediaId: string;
  labelId: string;
  descriptionId: string;
  dir: Direction;
  rootRef: RefObject<RootElement | null>;
  mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement | null>;
  portalContainer: Element | DocumentFragment | null;
  tooltipDelayDuration: number;
  tooltipSideOffset: number;
  disabled: boolean;
  isVideo: boolean;
  withoutTooltip: boolean;
}

const MediaPlayerContext = createContext<MediaPlayerContextValue | null>(null);

function useMediaPlayerContext(consumerName: string) {
  const context = use(MediaPlayerContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface MediaPlayerProps extends Omit<DivProps, "onTimeUpdate" | "onVolumeChange"> {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMuted?: (muted: boolean) => void;
  onMediaError?: (error: MediaError | null) => void;
  onPipError?: (error: unknown, state: "enter" | "exit") => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  dir?: Direction;
  label?: string;
  tooltipDelayDuration?: number;
  tooltipSideOffset?: number;
  autoHide?: boolean;
  disabled?: boolean;
  withoutTooltip?: boolean;
}

function MediaPlayer(props: MediaPlayerProps) {
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    controlsVisible: true,
    dragging: false,
    menuOpen: false,
    volumeIndicatorVisible: false,
  }));
  const storeRef = useLazyRef<Store>(() => ({
    subscribe: (cb) => {
      listenersRef.current.add(cb);
      return () => listenersRef.current.delete(cb);
    },
    getState: () => stateRef.current,
    setState: (key, value) => {
      if (Object.is(stateRef.current[key], value)) return;
      stateRef.current[key] = value;
      storeRef.current.notify();
    },
    notify: () => {
      for (const cb of listenersRef.current) {
        cb();
      }
    },
  }));

  return (
    <MediaProvider>
      <StoreContext value={storeRef.current}>
        <MediaPlayerImpl {...props} />
      </StoreContext>
    </MediaProvider>
  );
}

function MediaPlayerImpl(props: MediaPlayerProps) {
  const {
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onFullscreenChange,
    onVolumeChange,
    onMuted,
    onMediaError,
    onPipError,
    dir: dirProp,
    label,
    tooltipDelayDuration = 600,
    tooltipSideOffset = FLOATING_MENU_SIDE_OFFSET,
    asChild,
    autoHide = false,
    disabled = false,
    withoutTooltip = false,
    children,
    className,
    ref,
    ...rootImplProps
  } = props;

  const mediaId = useId();
  const labelId = useId();
  const descriptionId = useId();

  const rootRef = useRef<RootElement | null>(null);
  const fullscreenRef = useMediaFullscreenRef();
  const composedRef = useComposedRefs(ref, rootRef, fullscreenRef);

  const dir = DirectionPrimitive.useDirection(dirProp);
  const dispatch = useMediaDispatch();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const store = useStoreContext(ROOT_NAME);

  const controlsVisible = useStore((state) => state.controlsVisible);
  const dragging = useStore((state) => state.dragging);
  const menuOpen = useStore((state) => state.menuOpen);

  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMouseMoveRef = useRef<number>(Date.now());
  const volumeIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mediaPaused = useMediaSelector((state) => state.mediaPaused ?? true);
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false);

  const [mounted, setMounted] = useState(false);
  // The portal target depends on document/body, so it is resolved only after client mount.
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const portalContainer = mounted
    ? isFullscreen
      ? rootRef.current
      : globalThis.document.body
    : null;

  const isVideo =
    (typeof HTMLVideoElement !== "undefined" && mediaRef.current instanceof HTMLVideoElement) ||
    mediaRef.current?.tagName?.toLowerCase() === "mux-player";

  const onControlsShow = useMemoizedFn(() => {
    store.setState("controlsVisible", true);
    lastMouseMoveRef.current = Date.now();

    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (autoHide && !mediaPaused && !menuOpen && !dragging) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        store.setState("controlsVisible", false);
      }, 3000);
    }
  });

  const onVolumeIndicatorTrigger = useMemoizedFn(() => {
    if (menuOpen) return;

    store.setState("volumeIndicatorVisible", true);

    if (volumeIndicatorTimeoutRef.current) {
      clearTimeout(volumeIndicatorTimeoutRef.current);
    }

    volumeIndicatorTimeoutRef.current = setTimeout(() => {
      store.setState("volumeIndicatorVisible", false);
    }, 2000);

    if (autoHide) {
      onControlsShow();
    }
  });

  const onMouseLeave = useMemoizedFn((event: MouseEvent<RootElement>) => {
    rootImplProps.onMouseLeave?.(event);

    if (event.defaultPrevented) return;

    if (autoHide && !mediaPaused && !menuOpen && !dragging) {
      store.setState("controlsVisible", false);
    }
  });

  const onMouseMove = useMemoizedFn((event: MouseEvent<RootElement>) => {
    rootImplProps.onMouseMove?.(event);

    if (event.defaultPrevented) return;

    if (autoHide) {
      onControlsShow();
    }
  });

  // Auto-hide follows external media store updates: pause state, open menus, and dragging state.
  useEffect(() => {
    if (mediaPaused || menuOpen || dragging) {
      store.setState("controlsVisible", true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      return;
    }

    if (autoHide) {
      onControlsShow();
    }
  }, [store.setState, onControlsShow, autoHide, menuOpen, mediaPaused, dragging]);

  const onKeyDown = useMemoizedFn((event: KeyboardEvent<RootElement>) => {
    if (disabled) return;

    rootImplProps.onKeyDown?.(event);

    if (event.defaultPrevented) return;

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    const isMediaFocused = document.activeElement === mediaElement;
    const isPlayerFocused = document.activeElement?.closest('[data-slot="media-player"]') !== null;

    if (!isMediaFocused && !isPlayerFocused) return;

    if (autoHide) onControlsShow();

    switch (event.key.toLowerCase()) {
      case " ":
      case "k":
        event.preventDefault();
        dispatch({
          type: mediaElement.paused
            ? MediaActionTypes.MEDIA_PLAY_REQUEST
            : MediaActionTypes.MEDIA_PAUSE_REQUEST,
        });
        break;

      case "f":
        event.preventDefault();
        dispatch({
          type: document.fullscreenElement
            ? MediaActionTypes.MEDIA_EXIT_FULLSCREEN_REQUEST
            : MediaActionTypes.MEDIA_ENTER_FULLSCREEN_REQUEST,
        });
        break;

      case "m": {
        event.preventDefault();
        if (isVideo) {
          onVolumeIndicatorTrigger();
        }
        dispatch({
          type: mediaElement.muted
            ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
            : MediaActionTypes.MEDIA_MUTE_REQUEST,
        });
        break;
      }

      case "arrowright":
        event.preventDefault();
        if (isVideo || (mediaElement instanceof HTMLAudioElement && event.shiftKey)) {
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: Math.min(mediaElement.duration, mediaElement.currentTime + SEEK_STEP_SHORT),
          });
        }
        break;

      case "arrowleft":
        event.preventDefault();
        if (isVideo || (mediaElement instanceof HTMLAudioElement && event.shiftKey)) {
          dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: Math.max(0, mediaElement.currentTime - SEEK_STEP_SHORT),
          });
        }
        break;

      case "arrowup":
        event.preventDefault();
        if (isVideo) {
          onVolumeIndicatorTrigger();
          dispatch({
            type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
            detail: Math.min(1, mediaElement.volume + 0.1),
          });
        }
        break;

      case "arrowdown":
        event.preventDefault();
        if (isVideo) {
          onVolumeIndicatorTrigger();
          dispatch({
            type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
            detail: Math.max(0, mediaElement.volume - 0.1),
          });
        }
        break;

      case "<": {
        event.preventDefault();
        const currentRate = mediaElement.playbackRate;
        const currentIndex = SPEEDS.indexOf(currentRate);
        const newIndex = Math.max(0, currentIndex - 1);
        const newRate = SPEEDS[newIndex] ?? 1;
        dispatch({
          type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
          detail: newRate,
        });
        break;
      }

      case ">": {
        event.preventDefault();
        const currentRate = mediaElement.playbackRate;
        const currentIndex = SPEEDS.indexOf(currentRate);
        const newIndex = Math.min(SPEEDS.length - 1, currentIndex + 1);
        const newRate = SPEEDS[newIndex] ?? 1;
        dispatch({
          type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
          detail: newRate,
        });
        break;
      }

      case "c":
        event.preventDefault();
        if (isVideo && mediaElement.textTracks.length > 0) {
          dispatch({
            type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
          });
        }
        break;

      case "d": {
        const hasDownload = mediaElement.querySelector('[data-slot="media-player-download"]');

        if (!hasDownload) break;

        event.preventDefault();
        if (mediaElement.currentSrc) {
          const link = document.createElement("a");
          link.href = mediaElement.currentSrc;
          link.download = "";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
      }

      case "p": {
        event.preventDefault();
        if (isVideo && "requestPictureInPicture" in mediaElement) {
          const isPip = document.pictureInPictureElement === mediaElement;
          dispatch({
            type: isPip
              ? MediaActionTypes.MEDIA_EXIT_PIP_REQUEST
              : MediaActionTypes.MEDIA_ENTER_PIP_REQUEST,
          });
          if (isPip) {
            document.exitPictureInPicture().catch((error) => {
              onPipError?.(error, "exit");
            });
          } else {
            mediaElement.requestPictureInPicture().catch((error) => {
              onPipError?.(error, "enter");
            });
          }
        }
        break;
      }

      case "r": {
        event.preventDefault();
        mediaElement.loop = !mediaElement.loop;
        break;
      }

      case "j": {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: Math.max(0, mediaElement.currentTime - SEEK_STEP_LONG),
        });
        break;
      }

      case "l": {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: Math.min(mediaElement.duration, mediaElement.currentTime + SEEK_STEP_LONG),
        });
        break;
      }

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        event.preventDefault();
        const percent = Number.parseInt(event.key, 10) / 10;
        const seekTime = mediaElement.duration * percent;
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: seekTime,
        });
        break;
      }

      case "home": {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: 0,
        });
        break;
      }

      case "end": {
        event.preventDefault();
        dispatch({
          type: MediaActionTypes.MEDIA_SEEK_REQUEST,
          detail: mediaElement.duration,
        });
        break;
      }
    }
  });

  const onKeyUp = useMemoizedFn((event: KeyboardEvent<RootElement>) => {
    rootImplProps.onKeyUp?.(event);

    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "arrowdown" || key === "m") {
      onVolumeIndicatorTrigger();
    }
  });

  // Native media events live on the underlying audio/video element, outside React props.
  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    const handleTimeUpdate = () => onTimeUpdate?.(mediaElement.currentTime);
    const handleVolumeChange = () => {
      onVolumeChange?.(mediaElement.volume);
      onMuted?.(mediaElement.muted);
    };
    const handleMediaError = () => onMediaError?.(mediaElement.error);
    const handleFullscreenChange = () => onFullscreenChange?.(!!document.fullscreenElement);

    if (onPlay) mediaElement.addEventListener("play", onPlay);
    if (onPause) mediaElement.addEventListener("pause", onPause);
    if (onEnded) mediaElement.addEventListener("ended", onEnded);
    if (onTimeUpdate) mediaElement.addEventListener("timeupdate", handleTimeUpdate);
    if (onVolumeChange) mediaElement.addEventListener("volumechange", handleVolumeChange);
    if (onMediaError) mediaElement.addEventListener("error", handleMediaError);
    if (onFullscreenChange) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      if (onPlay) mediaElement.removeEventListener("play", onPlay);
      if (onPause) mediaElement.removeEventListener("pause", onPause);
      if (onEnded) mediaElement.removeEventListener("ended", onEnded);
      if (onTimeUpdate) mediaElement.removeEventListener("timeupdate", handleTimeUpdate);
      if (onVolumeChange) mediaElement.removeEventListener("volumechange", handleVolumeChange);
      if (onMediaError) mediaElement.removeEventListener("error", handleMediaError);
      if (onFullscreenChange) {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      }
      if (volumeIndicatorTimeoutRef.current) {
        clearTimeout(volumeIndicatorTimeoutRef.current);
      }
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onVolumeChange,
    onMuted,
    onMediaError,
    onFullscreenChange,
  ]);

  const contextValue: MediaPlayerContextValue = {
    mediaId,
    labelId,
    descriptionId,
    dir,
    rootRef,
    mediaRef,
    portalContainer,
    tooltipDelayDuration,
    tooltipSideOffset,
    disabled,
    isVideo,
    withoutTooltip,
  };

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <MediaPlayerContext value={contextValue}>
      <RootPrimitive
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        data-disabled={disabled ? "" : undefined}
        data-controls-visible={controlsVisible ? "" : undefined}
        data-slot="media-player"
        data-state={isFullscreen ? "fullscreen" : "windowed"}
        dir={dir}
        tabIndex={disabled ? undefined : 0}
        {...rootImplProps}
        ref={composedRef}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className={cn(
          "dark relative isolate flex flex-col overflow-hidden rounded-lg bg-background outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50 [&_video]:relative [&_video]:object-contain",
          "in-[:fullscreen]:flex in-[:fullscreen]:h-full in-[:fullscreen]:max-h-screen in-[:fullscreen]:flex-col in-[:fullscreen]:justify-between data-[state=fullscreen]:[&_video]:size-full",
          "**:data-slider:relative [&_[data-slider]::before]:absolute [&_[data-slider]::before]:inset-x-0 [&_[data-slider]::before]:-top-4 [&_[data-slider]::before]:-bottom-2 [&_[data-slider]::before]:z-10 [&_[data-slider]::before]:h-8 [&_[data-slider]::before]:cursor-pointer [&_[data-slider]::before]:content-[''] [&_[data-slot='media-player-seek']:not([data-hovering])::before]:cursor-default",
          "[&_video::-webkit-media-text-track-display]:top-auto! [&_video::-webkit-media-text-track-display]:bottom-[4%]! [&_video::-webkit-media-text-track-display]:mb-0! data-[state=fullscreen]:data-controls-visible:[&_video::-webkit-media-text-track-display]:bottom-[9%]! data-[state=fullscreen]:[&_video::-webkit-media-text-track-display]:bottom-[7%]! data-controls-visible:[&_video::-webkit-media-text-track-display]:bottom-[13%]!",
          className
        )}
      >
        <span id={labelId} className="sr-only">
          {label ?? "Media player"}
        </span>
        <span id={descriptionId} className="sr-only">
          {isVideo
            ? "Video player with custom controls for playback, volume, seeking, and more. Use space bar to play/pause, left/right arrows to seek, and up/down arrows to adjust volume."
            : "Audio player with custom controls for playback, volume, seeking, and more. Use space bar to play/pause, Shift + left/right arrows to seek, and up/down arrows to adjust volume."}
        </span>
        {children}
        <MediaPlayerVolumeIndicator />
      </RootPrimitive>
    </MediaPlayerContext>
  );
}

interface MediaPlayerVideoProps extends ComponentProps<"video"> {
  asChild?: boolean;
}

function MediaPlayerVideo(props: MediaPlayerVideoProps) {
  const { asChild, ref, ...videoProps } = props;

  const context = useMediaPlayerContext("MediaPlayerVideo");
  const dispatch = useMediaDispatch();
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(ref, context.mediaRef, mediaRefCallback);

  const onPlayToggle = useMemoizedFn((event: MouseEvent<HTMLVideoElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    const mediaElement = event.currentTarget;
    if (!mediaElement) return;

    dispatch({
      type: mediaElement.paused
        ? MediaActionTypes.MEDIA_PLAY_REQUEST
        : MediaActionTypes.MEDIA_PAUSE_REQUEST,
    });
  });

  const VideoPrimitive = asChild ? SlotPrimitive.Slot : "video";

  return (
    <VideoPrimitive
      aria-describedby={context.descriptionId}
      aria-labelledby={context.labelId}
      data-slot="media-player-video"
      {...videoProps}
      id={context.mediaId}
      ref={composedRef}
      onClick={onPlayToggle}
    />
  );
}

interface MediaPlayerAudioProps extends ComponentProps<"audio"> {
  asChild?: boolean;
}

function MediaPlayerAudio(props: MediaPlayerAudioProps) {
  const { asChild, ref, ...audioProps } = props;

  const context = useMediaPlayerContext("MediaPlayerAudio");
  const mediaRefCallback = useMediaRef();
  const composedRef = useComposedRefs(ref, context.mediaRef, mediaRefCallback);

  const AudioPrimitive = asChild ? SlotPrimitive.Slot : "audio";

  return (
    <AudioPrimitive
      aria-describedby={context.descriptionId}
      aria-labelledby={context.labelId}
      data-slot="media-player-audio"
      {...audioProps}
      id={context.mediaId}
      ref={composedRef}
    />
  );
}

function MediaPlayerControls(props: DivProps) {
  const { asChild, className, ...controlsProps } = props;

  const context = useMediaPlayerContext("MediaPlayerControls");
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false);
  const controlsVisible = useStore((state) => state.controlsVisible);

  const ControlsPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ControlsPrimitive
      data-disabled={context.disabled ? "" : undefined}
      data-slot="media-player-controls"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-visible={controlsVisible ? "" : undefined}
      dir={context.dir}
      className={cn(
        "dark pointer-events-none absolute right-0 bottom-0 left-0 z-50 flex items-center gap-2 in-[:fullscreen]:px-6 px-4 in-[:fullscreen]:py-4 py-3 opacity-0 transition-opacity duration-200 data-visible:pointer-events-auto data-visible:opacity-100",
        className
      )}
      {...controlsProps}
    />
  );
}

interface MediaPlayerLoadingProps extends DivProps {
  delayMs?: number;
}

function MediaPlayerLoading(props: MediaPlayerLoadingProps) {
  const { delayMs = 500, asChild, className, children, ...loadingProps } = props;

  const isLoading = useMediaSelector((state) => state.mediaLoading ?? false);
  const isPaused = useMediaSelector((state) => state.mediaPaused ?? true);
  const hasPlayed = useMediaSelector((state) => state.mediaHasPlayed ?? false);

  const shouldShowLoading = isLoading && !isPaused;
  const shouldUseDelay = hasPlayed && shouldShowLoading;
  const loadingDelayMs = shouldUseDelay ? delayMs : 0;

  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Loading has a small display delay to avoid flashing for very short buffering states.
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (shouldShowLoading) {
      if (loadingDelayMs > 0) {
        timeoutRef.current = setTimeout(() => {
          setShouldRender(true);
          timeoutRef.current = null;
        }, loadingDelayMs);
      } else {
        setShouldRender(true);
      }
    } else {
      setShouldRender(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [shouldShowLoading, loadingDelayMs]);

  if (!shouldRender) return null;

  const LoadingPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <LoadingPrimitive
      role="status"
      aria-live="polite"
      data-slot="media-player-loading"
      {...loadingProps}
      className={cn(
        "fade-in-0 zoom-in-95 pointer-events-none absolute inset-0 z-50 flex animate-in items-center justify-center duration-200",
        className
      )}
    >
      {children ?? <Loader2 className="size-20 animate-spin stroke-[.0938rem] text-primary" />}
    </LoadingPrimitive>
  );
}

interface MediaPlayerErrorProps extends DivProps {
  error?: MediaError | null;
  label?: string;
  description?: string;
  onRetry?: () => void;
  onReload?: () => void;
  asChild?: boolean;
}

function MediaPlayerError(props: MediaPlayerErrorProps) {
  const {
    error: errorProp,
    label,
    description,
    onRetry: onRetryProp,
    onReload: onReloadProp,
    asChild,
    className,
    children,
    ...errorProps
  } = props;

  const context = useMediaPlayerContext("MediaPlayerError");
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false);
  const mediaError = useMediaSelector((state) => state.mediaError);

  const error = errorProp ?? mediaError;

  const labelId = useId();
  const descriptionId = useId();

  const [actionState, setActionState] = useState<{
    retryPending: boolean;
    reloadPending: boolean;
  }>({
    retryPending: false,
    reloadPending: false,
  });

  const onRetry = useMemoizedFn(() => {
    setActionState((prev) => ({ ...prev, retryPending: true }));

    requestAnimationFrame(() => {
      const mediaElement = context.mediaRef.current;
      if (!mediaElement) {
        setActionState((prev) => ({ ...prev, retryPending: false }));
        return;
      }

      if (onRetryProp) {
        onRetryProp();
      } else {
        const currentSrc = mediaElement.currentSrc ?? mediaElement.src;
        if (currentSrc) {
          mediaElement.load();
        }
      }

      setActionState((prev) => ({ ...prev, retryPending: false }));
    });
  });

  const onReload = useMemoizedFn(() => {
    setActionState((prev) => ({ ...prev, reloadPending: true }));

    requestAnimationFrame(() => {
      if (onReloadProp) {
        onReloadProp();
      } else {
        window.location.reload();
      }
    });
  });

  const errorLabel = getErrorLabel(label, error);
  const errorDescription = getErrorDescription(description, error);

  if (!error) return null;

  const ErrorPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ErrorPrimitive
      role="alert"
      aria-describedby={descriptionId}
      aria-labelledby={labelId}
      aria-live="assertive"
      data-slot="media-player-error"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      {...errorProps}
      className={cn(
        "pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 text-foreground backdrop-blur-sm",
        className
      )}
    >
      {children ?? (
        <div className="flex max-w-md flex-col items-center gap-4 px-6 py-8 text-center">
          <AlertTriangle className="size-12 text-destructive" />
          <div className="flex flex-col gap-px text-center">
            <h3 className="font-semibold text-xl tracking-tight">{errorLabel}</h3>
            <p className="text-balance text-muted-foreground text-sm leading-relaxed">
              {errorDescription}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              disabled={actionState.retryPending}
            >
              {actionState.retryPending ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              Try again
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReload}
              disabled={actionState.reloadPending}
            >
              {actionState.reloadPending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
              Reload page
            </Button>
          </div>
        </div>
      )}
    </ErrorPrimitive>
  );
}

function MediaPlayerVolumeIndicator(props: DivProps) {
  const { asChild, className, ...indicatorProps } = props;

  const mediaVolume = useMediaSelector((state) => state.mediaVolume ?? 1);
  const mediaMuted = useMediaSelector((state) => state.mediaMuted ?? false);
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel ?? "high");
  const volumeIndicatorVisible = useStore((state) => state.volumeIndicatorVisible);

  if (!volumeIndicatorVisible) return null;

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;
  const volumePercentage = Math.round(effectiveVolume * 100);
  const barCount = 10;
  const activeBarCount = Math.ceil(effectiveVolume * barCount);

  const VolumeIndicatorPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <VolumeIndicatorPrimitive
      role="status"
      aria-live="polite"
      aria-label={`Volume ${mediaMuted ? "muted" : `${volumePercentage}%`}`}
      data-slot="media-player-volume-indicator"
      {...indicatorProps}
      className={cn(
        "pointer-events-none absolute inset-0 z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="fade-in-0 zoom-in-95 flex animate-in flex-col items-center gap-3 rounded-lg bg-popover/80 px-6 py-4 text-popover-foreground backdrop-blur-xs duration-200">
        <div className="flex items-center gap-2">
          {mediaVolumeLevel === "off" || mediaMuted ? (
            <VolumeX className="size-6" />
          ) : mediaVolumeLevel === "high" ? (
            <Volume2 className="size-6" />
          ) : (
            <Volume1 className="size-6" />
          )}
          <span className="font-medium text-sm tabular-nums">
            {mediaMuted ? "Muted" : `${volumePercentage}%`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: barCount }, (_, index) => (
            <div
              key={index}
              className={cn(
                "w-1.5 rounded-full transition-all duration-150",
                index < activeBarCount && !mediaMuted
                  ? "scale-100 bg-white"
                  : "scale-90 bg-white/30"
              )}
              style={{
                height: `${12 + index * 2}px`,
                animationDelay: `${index * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </VolumeIndicatorPrimitive>
  );
}

function MediaPlayerControlsOverlay(props: DivProps) {
  const { asChild, className, ...overlayProps } = props;

  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false);
  const controlsVisible = useStore((state) => state.controlsVisible);

  const OverlayPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OverlayPrimitive
      data-slot="media-player-controls-overlay"
      data-state={isFullscreen ? "fullscreen" : "windowed"}
      data-visible={controlsVisible ? "" : undefined}
      {...overlayProps}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-200 data-visible:opacity-100",
        className
      )}
    />
  );
}

function MediaPlayerPlay(props: ComponentProps<typeof Button>) {
  const { children, className, disabled, ...playButtonProps } = props;

  const context = useMediaPlayerContext("MediaPlayerPlay");
  const dispatch = useMediaDispatch();
  const mediaPaused = useMediaSelector((state) => state.mediaPaused ?? true);

  const isDisabled = disabled || context.disabled;

  const onPlayToggle = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: mediaPaused
        ? MediaActionTypes.MEDIA_PLAY_REQUEST
        : MediaActionTypes.MEDIA_PAUSE_REQUEST,
    });
  });

  return (
    <MediaPlayerTooltip tooltip={mediaPaused ? "Play" : "Pause"} shortcut="Space">
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={mediaPaused ? "Play" : "Pause"}
        aria-pressed={!mediaPaused}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-play-button"
        data-state={mediaPaused ? "off" : "on"}
        disabled={isDisabled}
        {...playButtonProps}
        variant="ghost"
        size="icon"
        className={cn("size-8 [&_svg:not([class*='fill-'])]:fill-current", className)}
        onClick={onPlayToggle}
      >
        {children ?? (mediaPaused ? <Play /> : <Pause />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSeekBackwardProps extends ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekBackward(props: MediaPlayerSeekBackwardProps) {
  const { seconds = SEEK_STEP_SHORT, children, className, disabled, ...seekBackwardProps } = props;

  const context = useMediaPlayerContext("MediaPlayerSeekBackward");
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime ?? 0);

  const isDisabled = disabled || context.disabled;

  const onSeekBackward = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: Math.max(0, mediaCurrentTime - seconds),
    });
  });

  return (
    <MediaPlayerTooltip
      tooltip={`Back ${seconds}s`}
      shortcut={context.isVideo ? ["Left"] : ["Shift", "Left"]}
    >
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={`Back ${seconds} seconds`}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-backward"
        disabled={isDisabled}
        {...seekBackwardProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekBackward}
      >
        {children ?? <Rewind />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSeekForwardProps extends ComponentProps<typeof Button> {
  seconds?: number;
}

function MediaPlayerSeekForward(props: MediaPlayerSeekForwardProps) {
  const { seconds = SEEK_STEP_LONG, children, className, disabled, ...seekForwardProps } = props;

  const context = useMediaPlayerContext("MediaPlayerSeekForward");
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime ?? 0);
  const [, seekableEnd] = useMediaSelector((state) => state.mediaSeekable ?? [0, 0]);
  const isDisabled = disabled || context.disabled;

  const onSeekForward = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: Math.min(seekableEnd ?? Number.POSITIVE_INFINITY, mediaCurrentTime + seconds),
    });
  });

  return (
    <MediaPlayerTooltip
      tooltip={`Forward ${seconds}s`}
      shortcut={context.isVideo ? ["Right"] : ["Shift", "Right"]}
    >
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={`Forward ${seconds} seconds`}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-seek-forward"
        disabled={isDisabled}
        {...seekForwardProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onSeekForward}
      >
        {children ?? <FastForward />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface SeekState {
  isHovering: boolean;
  pendingSeekTime: number | null;
  hasInitialPosition: boolean;
}

interface MediaPlayerSeekProps extends ComponentProps<typeof SliderPrimitive.Root> {
  withTime?: boolean;
  withoutChapter?: boolean;
  withoutTooltip?: boolean;
  tooltipThumbnailSrc?: string | ((time: number) => string);
  tooltipTimeVariant?: "current" | "progress";
  tooltipSideOffset?: number;
  tooltipCollisionBoundary?: Element | Element[];
  tooltipCollisionPadding?: number | Partial<Record<"top" | "right" | "bottom" | "left", number>>;
}

function MediaPlayerSeek(props: MediaPlayerSeekProps) {
  const {
    withTime = false,
    withoutChapter = false,
    withoutTooltip = false,
    tooltipTimeVariant = "current",
    tooltipThumbnailSrc,
    tooltipSideOffset,
    tooltipCollisionPadding = SEEK_COLLISION_PADDING,
    tooltipCollisionBoundary,
    className,
    disabled,
    ...seekProps
  } = props;

  const context = useMediaPlayerContext(SEEK_NAME);
  const store = useStoreContext(SEEK_NAME);
  const dispatch = useMediaDispatch();
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime ?? 0);
  const [seekableStart = 0, seekableEnd = 0] = useMediaSelector(
    (state) => state.mediaSeekable ?? [0, 0]
  );
  const mediaBuffered = useMediaSelector((state) => state.mediaBuffered ?? []);
  const mediaEnded = useMediaSelector((state) => state.mediaEnded ?? false);

  const chapterCues = useMediaSelector((state) => state.mediaChaptersCues ?? []);
  const mediaPreviewTime = useMediaSelector((state) => state.mediaPreviewTime);
  const mediaPreviewImage = useMediaSelector((state) => state.mediaPreviewImage);
  const mediaPreviewCoords = useMediaSelector((state) => state.mediaPreviewCoords);

  const seekRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const justCommittedRef = useRef<boolean>(false);

  const hoverTimeRef = useRef(0);
  const tooltipXRef = useRef(0);
  const tooltipYRef = useRef(0);
  const seekRectRef = useRef<DOMRect | null>(null);
  const collisionDataRef = useRef<{
    padding: { top: number; right: number; bottom: number; left: number };
    boundaries: Element[];
  } | null>(null);

  const [seekState, setSeekState] = useState<SeekState>({
    isHovering: false,
    pendingSeekTime: null,
    hasInitialPosition: false,
  });

  const rafIdRef = useRef<number | null>(null);
  const seekThrottleRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const lastPointerXRef = useRef<number>(0);
  const lastPointerYRef = useRef<number>(0);
  const previewDebounceRef = useRef<number | null>(null);
  const pointerEnterTimeRef = useRef<number>(0);
  const horizontalMovementRef = useRef<number>(0);
  const verticalMovementRef = useRef<number>(0);
  const lastSeekCommitTimeRef = useRef<number>(0);

  const timeCache = useRef<Map<number, string>>(new Map());

  const displayValue = seekState.pendingSeekTime ?? mediaCurrentTime;

  const isDisabled = disabled || context.disabled;
  const tooltipDisabled = withoutTooltip || context.withoutTooltip || store.getState().menuOpen;

  const currentTooltipSideOffset = tooltipSideOffset ?? context.tooltipSideOffset;

  const getCachedTime = useMemoizedFn((time: number, duration: number) => {
    const roundedTime = Math.floor(time);
    const key = roundedTime + duration * 10000;

    if (timeCache.current.has(key)) {
      return timeCache.current.get(key) as string;
    }

    const formatted = timeUtils.formatTime(time, duration);
    timeCache.current.set(key, formatted);

    if (timeCache.current.size > 100) {
      timeCache.current.clear();
    }

    return formatted;
  });

  const currentTime = getCachedTime(displayValue, seekableEnd);
  const duration = getCachedTime(seekableEnd, seekableEnd);
  const remainingTime = getCachedTime(seekableEnd - displayValue, seekableEnd);

  const onCollisionDataUpdate = useMemoizedFn(() => {
    if (collisionDataRef.current) return collisionDataRef.current;

    const padding =
      typeof tooltipCollisionPadding === "number"
        ? {
            top: tooltipCollisionPadding,
            right: tooltipCollisionPadding,
            bottom: tooltipCollisionPadding,
            left: tooltipCollisionPadding,
          }
        : { top: 0, right: 0, bottom: 0, left: 0, ...tooltipCollisionPadding };

    const boundaries = tooltipCollisionBoundary
      ? Array.isArray(tooltipCollisionBoundary)
        ? tooltipCollisionBoundary
        : [tooltipCollisionBoundary]
      : ([context.rootRef.current].filter(Boolean) as Element[]);

    collisionDataRef.current = { padding, boundaries };
    return collisionDataRef.current;
  });

  const getCurrentChapterCue = useMemoizedFn((time: number) => {
    if (withoutChapter || chapterCues.length === 0) return null;
    return chapterCues.find((c) => time >= c.startTime && time < c.endTime);
  });

  const getThumbnail = useMemoizedFn((time: number) => {
    if (tooltipDisabled) return null;

    if (tooltipThumbnailSrc) {
      const src =
        typeof tooltipThumbnailSrc === "function" ? tooltipThumbnailSrc(time) : tooltipThumbnailSrc;
      return { src, coords: null };
    }

    if (
      mediaPreviewTime !== undefined &&
      Math.abs(time - mediaPreviewTime) < 0.1 &&
      mediaPreviewImage
    ) {
      return {
        src: mediaPreviewImage,
        coords: mediaPreviewCoords ?? null,
      };
    }

    return null;
  });

  const onPreviewUpdate = useMemoizedFn((time: number) => {
    if (tooltipDisabled) return;

    if (previewDebounceRef.current) {
      cancelAnimationFrame(previewDebounceRef.current);
    }

    previewDebounceRef.current = requestAnimationFrame(() => {
      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: time,
      });
      previewDebounceRef.current = null;
    });
  });

  const onTooltipPositionUpdate = useMemoizedFn((clientX: number) => {
    if (!seekRef.current) return;

    const tooltipWidth = tooltipRef.current?.offsetWidth ?? SEEK_TOOLTIP_WIDTH_FALLBACK;

    let x = clientX;
    const y = seekRectRef.current?.top ?? 0;

    const collisionData = onCollisionDataUpdate();
    const halfTooltipWidth = tooltipWidth / 2;

    let minLeft = 0;
    let maxRight = window.innerWidth;

    for (const boundary of collisionData.boundaries) {
      const boundaryRect = boundary.getBoundingClientRect();
      minLeft = Math.max(minLeft, boundaryRect.left + collisionData.padding.left);
      maxRight = Math.min(maxRight, boundaryRect.right - collisionData.padding.right);
    }

    if (x - halfTooltipWidth < minLeft) {
      x = minLeft + halfTooltipWidth;
    } else if (x + halfTooltipWidth > maxRight) {
      x = maxRight - halfTooltipWidth;
    }

    const viewportPadding = SEEK_COLLISION_PADDING;
    if (x - halfTooltipWidth < viewportPadding) {
      x = viewportPadding + halfTooltipWidth;
    } else if (x + halfTooltipWidth > window.innerWidth - viewportPadding) {
      x = window.innerWidth - viewportPadding - halfTooltipWidth;
    }

    tooltipXRef.current = x;
    tooltipYRef.current = y;

    if (tooltipRef.current) {
      tooltipRef.current.style.setProperty(SEEK_TOOLTIP_X, `${x}px`);
      tooltipRef.current.style.setProperty(SEEK_TOOLTIP_Y, `${y}px`);
    }

    if (!seekState.hasInitialPosition) {
      setSeekState((prev) => ({ ...prev, hasInitialPosition: true }));
    }
  });

  const onHoverProgressUpdate = useMemoizedFn(() => {
    if (!seekRef.current || seekableEnd <= 0) return;

    const hoverPercent = Math.min(100, (hoverTimeRef.current / seekableEnd) * 100);
    seekRef.current.style.setProperty(SEEK_HOVER_PERCENT, `${hoverPercent.toFixed(4)}%`);
  });

  // The media store reports current time asynchronously after a seek request; clear pending state once it catches up.
  useEffect(() => {
    if (seekState.pendingSeekTime !== null) {
      const diff = Math.abs(mediaCurrentTime - seekState.pendingSeekTime);
      if (diff < 0.5) {
        setSeekState((prev) => ({ ...prev, pendingSeekTime: null }));
      }
    }
  }, [mediaCurrentTime, seekState.pendingSeekTime]);

  // Tooltip preview tracks document scrolling while the pointer is hovering over the seek bar.
  useEffect(() => {
    if (!seekState.isHovering || tooltipDisabled) return;

    function onScroll() {
      setSeekState((prev) => ({
        ...prev,
        isHovering: false,
        hasInitialPosition: false,
      }));
      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: undefined,
      });
    }

    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [dispatch, seekState.isHovering, tooltipDisabled]);

  const bufferedProgress = getBufferedProgress({
    mediaBuffered,
    mediaCurrentTime,
    seekableEnd,
    mediaEnded,
    seekableStart,
  });

  const onPointerEnter = useMemoizedFn(() => {
    if (seekRef.current) {
      seekRectRef.current = seekRef.current.getBoundingClientRect();
    }

    collisionDataRef.current = null;
    pointerEnterTimeRef.current = Date.now();
    horizontalMovementRef.current = 0;
    verticalMovementRef.current = 0;

    if (seekableEnd > 0) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (!tooltipDisabled) {
        if (lastPointerXRef.current && seekRectRef.current) {
          const clientX = Math.max(
            seekRectRef.current.left,
            Math.min(lastPointerXRef.current, seekRectRef.current.right)
          );
          onTooltipPositionUpdate(clientX);
        }
      }
    }
  });

  const onPointerLeave = useMemoizedFn(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (previewDebounceRef.current) {
      cancelAnimationFrame(previewDebounceRef.current);
      previewDebounceRef.current = null;
    }

    setSeekState((prev) => ({
      ...prev,
      isHovering: false,
      hasInitialPosition: false,
    }));

    justCommittedRef.current = false;
    seekRectRef.current = null;
    collisionDataRef.current = null;

    pointerEnterTimeRef.current = 0;
    horizontalMovementRef.current = 0;
    verticalMovementRef.current = 0;
    lastPointerXRef.current = 0;
    lastPointerYRef.current = 0;
    lastSeekCommitTimeRef.current = 0;

    if (!tooltipDisabled) {
      dispatch({
        type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
        detail: undefined,
      });
    }
  });

  const onPointerMove = useMemoizedFn((event: PointerEvent<HTMLDivElement>) => {
    if (seekableEnd <= 0) return;

    if (!seekRectRef.current && seekRef.current) {
      seekRectRef.current = seekRef.current.getBoundingClientRect();
    }

    if (!seekRectRef.current) return;

    const currentX = event.clientX;
    const currentY = event.clientY;

    if (lastPointerXRef.current !== 0 && lastPointerYRef.current !== 0) {
      const deltaX = Math.abs(currentX - lastPointerXRef.current);
      const deltaY = Math.abs(currentY - lastPointerYRef.current);

      horizontalMovementRef.current += deltaX;
      verticalMovementRef.current += deltaY;
    }

    lastPointerXRef.current = currentX;
    lastPointerYRef.current = currentY;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const wasJustCommitted = justCommittedRef.current;
      if (wasJustCommitted) {
        justCommittedRef.current = false;
      }

      const seekRect = seekRectRef.current;
      if (!seekRect) {
        rafIdRef.current = null;
        return;
      }

      const clientX = lastPointerXRef.current;
      const offsetXOnSeekBar = Math.max(0, Math.min(clientX - seekRect.left, seekRect.width));
      const relativeX = offsetXOnSeekBar / seekRect.width;
      const calculatedHoverTime = relativeX * seekableEnd;

      hoverTimeRef.current = calculatedHoverTime;

      onHoverProgressUpdate();

      const wasHovering = seekState.isHovering;
      const isCurrentlyHovering = clientX >= seekRect.left && clientX <= seekRect.right;

      const timeHovering = Date.now() - pointerEnterTimeRef.current;
      const totalMovement = horizontalMovementRef.current + verticalMovementRef.current;
      const horizontalRatio = totalMovement > 0 ? horizontalMovementRef.current / totalMovement : 0;

      const timeSinceSeekCommit = Date.now() - lastSeekCommitTimeRef.current;
      const isInSeekCooldown = timeSinceSeekCommit < 300;

      const shouldShowTooltip =
        !wasJustCommitted &&
        !isInSeekCooldown &&
        (timeHovering > 150 || horizontalRatio > 0.6 || (totalMovement < 10 && timeHovering > 50));

      if (!wasHovering && isCurrentlyHovering && shouldShowTooltip && !tooltipDisabled) {
        setSeekState((prev) => ({ ...prev, isHovering: true }));
      }

      if (!tooltipDisabled) {
        onPreviewUpdate(calculatedHoverTime);

        if (isCurrentlyHovering && (wasHovering || shouldShowTooltip)) {
          onTooltipPositionUpdate(clientX);
        }
      }

      rafIdRef.current = null;
    });
  });

  const onSeek = useMemoizedFn((value: number[]) => {
    const time = value[0] ?? 0;

    setSeekState((prev) => ({ ...prev, pendingSeekTime: time }));

    if (!store.getState().dragging) {
      store.setState("dragging", true);
    }

    if (seekThrottleRef.current) {
      cancelAnimationFrame(seekThrottleRef.current);
    }

    seekThrottleRef.current = requestAnimationFrame(() => {
      dispatch({
        type: MediaActionTypes.MEDIA_SEEK_REQUEST,
        detail: time,
      });
      seekThrottleRef.current = null;
    });
  });

  const onSeekCommit = useMemoizedFn((value: number[]) => {
    const time = value[0] ?? 0;

    if (seekThrottleRef.current) {
      cancelAnimationFrame(seekThrottleRef.current);
      seekThrottleRef.current = null;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (previewDebounceRef.current) {
      cancelAnimationFrame(previewDebounceRef.current);
      previewDebounceRef.current = null;
    }

    setSeekState((prev) => ({
      ...prev,
      pendingSeekTime: time,
      isHovering: false,
      hasInitialPosition: false,
    }));

    justCommittedRef.current = true;
    collisionDataRef.current = null;
    lastSeekCommitTimeRef.current = Date.now();

    // Reset movement tracking after seek commit
    pointerEnterTimeRef.current = Date.now();
    horizontalMovementRef.current = 0;
    verticalMovementRef.current = 0;

    if (store.getState().dragging) {
      store.setState("dragging", false);
    }

    dispatch({
      type: MediaActionTypes.MEDIA_SEEK_REQUEST,
      detail: time,
    });

    dispatch({
      type: MediaActionTypes.MEDIA_PREVIEW_REQUEST,
      detail: undefined,
    });
  });

  // Seek interactions schedule animation frames and timeouts that must be canceled on unmount.
  useEffect(() => {
    return () => {
      if (seekThrottleRef.current) {
        cancelAnimationFrame(seekThrottleRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (previewDebounceRef.current) {
        cancelAnimationFrame(previewDebounceRef.current);
      }
    };
  }, []);

  const currentChapterCue = getCurrentChapterCue(hoverTimeRef.current);
  const thumbnail = getThumbnail(hoverTimeRef.current);
  const hoverTime = getCachedTime(hoverTimeRef.current, seekableEnd);

  const chapterSeparators =
    withoutChapter || chapterCues.length <= 1 || seekableEnd <= 0
      ? null
      : chapterCues.slice(1).map((chapterCue, index) => {
          const position = (chapterCue.startTime / seekableEnd) * 100;

          return (
            <div
              key={`chapter-${index}-${chapterCue.startTime}`}
              role="presentation"
              aria-hidden="true"
              data-slot="media-player-seek-chapter-separator"
              className="absolute top-0 h-full bg-background"
              style={{
                width: ".1563rem",
                left: `${position}%`,
                transform: "translateX(-50%)",
              }}
            />
          );
        });

  const spriteStyle = getSpriteStyle(thumbnail);

  const SeekSlider = (
    <div data-slot="media-player-seek-container" className="relative w-full">
      <SliderPrimitive.Root
        aria-controls={context.mediaId}
        aria-valuetext={`${currentTime} of ${duration}`}
        data-hovering={seekState.isHovering ? "" : undefined}
        data-slider=""
        data-slot="media-player-seek"
        disabled={isDisabled}
        {...seekProps}
        ref={seekRef}
        min={seekableStart}
        max={seekableEnd}
        step={0.01}
        className={cn(
          "relative flex w-full touch-none select-none items-center data-disabled:pointer-events-none data-disabled:opacity-50",
          className
        )}
        value={[displayValue]}
        onValueChange={onSeek}
        onValueCommit={onSeekCommit}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/40">
          <div
            data-slot="media-player-seek-buffered"
            className="absolute h-full bg-primary/70 will-change-[width]"
            style={{
              width: `${bufferedProgress * 100}%`,
            }}
          />
          <SliderPrimitive.Range className="absolute h-full bg-primary will-change-[width]" />
          {seekState.isHovering && seekableEnd > 0 && (
            <div
              data-slot="media-player-seek-hover-range"
              className="absolute h-full bg-primary/70 will-change-[width,opacity]"
              style={{
                width: `var(${SEEK_HOVER_PERCENT}, 0%)`,
                transition: "opacity 150ms ease-out",
              }}
            />
          )}
          {chapterSeparators}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative z-10 block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      {!withoutTooltip && !context.withoutTooltip && seekState.isHovering && seekableEnd > 0 && (
        <MediaPlayerPortal>
          <div
            ref={tooltipRef}
            className="backface-hidden contain-[layout_style] pointer-events-none z-50 [transition:opacity_150ms_ease-in-out]"
            style={{
              position: "fixed" as const,
              left: `var(${SEEK_TOOLTIP_X}, 0rem)`,
              top: `var(${SEEK_TOOLTIP_Y}, 0rem)`,
              transform: `translateX(-50%) translateY(calc(-100% - ${currentTooltipSideOffset}px))`,
              visibility: seekState.hasInitialPosition ? "visible" : "hidden",
              opacity: seekState.hasInitialPosition ? 1 : 0,
            }}
          >
            <div
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border bg-popover text-popover-foreground shadow-sm",
                thumbnail && "min-h-10",
                !thumbnail && currentChapterCue && "px-3 py-1.5"
              )}
            >
              {thumbnail?.src && (
                <div
                  data-slot="media-player-seek-thumbnail"
                  className="overflow-hidden rounded-md rounded-b-none"
                  style={{
                    width: `${SPRITE_CONTAINER_WIDTH}px`,
                    height: `${SPRITE_CONTAINER_HEIGHT}px`,
                  }}
                >
                  {thumbnail.coords ? (
                    <div style={spriteStyle} />
                  ) : (
                    // biome-ignore lint/performance/noImgElement: dynamic thumbnail URLs from media don't work well with Next.js Image optimization
                    <img
                      src={thumbnail.src}
                      alt={`Preview at ${hoverTime}`}
                      className="size-full object-cover"
                    />
                  )}
                </div>
              )}
              {currentChapterCue && (
                <div
                  data-slot="media-player-seek-chapter-title"
                  className="line-clamp-2 max-w-48 text-balance text-center text-xs"
                >
                  {currentChapterCue.text}
                </div>
              )}
              <div
                data-slot="media-player-seek-time"
                className={cn(
                  "whitespace-nowrap text-center text-xs tabular-nums",
                  thumbnail && "pb-1.5",
                  !(thumbnail || currentChapterCue) && "px-2.5 py-1"
                )}
              >
                {tooltipTimeVariant === "progress" ? `${hoverTime} / ${duration}` : hoverTime}
              </div>
            </div>
          </div>
        </MediaPlayerPortal>
      )}
    </div>
  );

  if (withTime) {
    return (
      <div className="flex w-full items-center gap-2">
        <span className="text-sm tabular-nums">{currentTime}</span>
        {SeekSlider}
        <span className="text-sm tabular-nums">{remainingTime}</span>
      </div>
    );
  }

  return SeekSlider;
}

interface MediaPlayerVolumeProps extends ComponentProps<typeof SliderPrimitive.Root> {
  asChild?: boolean;
  expandable?: boolean;
}

function MediaPlayerVolume(props: MediaPlayerVolumeProps) {
  const { expandable = false, className, disabled, ...volumeProps } = props;

  const context = useMediaPlayerContext(VOLUME_NAME);
  const store = useStoreContext(VOLUME_NAME);
  const dispatch = useMediaDispatch();
  const mediaVolume = useMediaSelector((state) => state.mediaVolume ?? 1);
  const mediaMuted = useMediaSelector((state) => state.mediaMuted ?? false);
  const mediaVolumeLevel = useMediaSelector((state) => state.mediaVolumeLevel ?? "high");

  const sliderId = useId();
  const volumeTriggerId = useId();

  const isDisabled = disabled || context.disabled;

  const onMute = useMemoizedFn(() => {
    dispatch({
      type: mediaMuted
        ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
        : MediaActionTypes.MEDIA_MUTE_REQUEST,
    });
  });

  const onVolumeChange = useMemoizedFn((value: number[]) => {
    const volume = value[0] ?? 0;

    if (!store.getState().dragging) {
      store.setState("dragging", true);
    }

    dispatch({
      type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
      detail: volume,
    });
  });

  const onVolumeCommit = useMemoizedFn((value: number[]) => {
    const volume = value[0] ?? 0;

    if (store.getState().dragging) {
      store.setState("dragging", false);
    }

    dispatch({
      type: MediaActionTypes.MEDIA_VOLUME_REQUEST,
      detail: volume,
    });
  });

  const effectiveVolume = mediaMuted ? 0 : mediaVolume;

  return (
    <div
      data-disabled={isDisabled ? "" : undefined}
      data-slot="media-player-volume-container"
      className={cn(
        "group flex items-center",
        expandable ? "gap-0 group-focus-within:gap-2 group-hover:gap-1.5" : "gap-1.5",
        className
      )}
    >
      <MediaPlayerTooltip tooltip="Volume" shortcut="M">
        <Button
          id={volumeTriggerId}
          type="button"
          aria-controls={`${context.mediaId} ${sliderId}`}
          aria-label={mediaMuted ? "Unmute" : "Mute"}
          aria-pressed={mediaMuted}
          data-slot="media-player-volume-trigger"
          data-state={mediaMuted ? "on" : "off"}
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isDisabled}
          onClick={onMute}
        >
          {mediaVolumeLevel === "off" || mediaMuted ? (
            <VolumeX />
          ) : mediaVolumeLevel === "high" ? (
            <Volume2 />
          ) : (
            <Volume1 />
          )}
        </Button>
      </MediaPlayerTooltip>
      <SliderPrimitive.Root
        id={sliderId}
        aria-controls={context.mediaId}
        aria-valuetext={`${Math.round(effectiveVolume * 100)}% volume`}
        data-slider=""
        data-slot="media-player-volume"
        {...volumeProps}
        min={0}
        max={1}
        step={0.1}
        className={cn(
          "relative flex touch-none select-none items-center",
          expandable
            ? "w-0 opacity-0 transition-[width,opacity] duration-200 ease-in-out group-focus-within:w-16 group-focus-within:opacity-100 group-hover:w-16 group-hover:opacity-100"
            : "w-16",
          className
        )}
        disabled={isDisabled}
        value={[effectiveVolume]}
        onValueChange={onVolumeChange}
        onValueCommit={onVolumeCommit}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-primary will-change-[width]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block size-2.5 shrink-0 rounded-full bg-primary shadow-sm ring-ring/50 transition-[color,box-shadow] will-change-transform hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
}

interface MediaPlayerTimeProps extends ComponentProps<"div"> {
  variant?: "progress" | "remaining" | "duration";
  asChild?: boolean;
}

function MediaPlayerTime(props: MediaPlayerTimeProps) {
  const { variant = "progress", asChild, className, ...timeProps } = props;

  const context = useMediaPlayerContext("MediaPlayerTime");
  const mediaCurrentTime = useMediaSelector((state) => state.mediaCurrentTime ?? 0);
  const [, seekableEnd = 0] = useMediaSelector((state) => state.mediaSeekable ?? [0, 0]);

  const times = getMediaTimes({ variant, mediaCurrentTime, seekableEnd });

  const TimePrimitive = asChild ? SlotPrimitive.Slot : "div";

  if (variant === "remaining" || variant === "duration") {
    return (
      <TimePrimitive
        data-slot="media-player-time"
        data-variant={variant}
        dir={context.dir}
        {...timeProps}
        className={cn("text-foreground/80 text-sm tabular-nums", className)}
      >
        {times[variant]}
      </TimePrimitive>
    );
  }

  return (
    <TimePrimitive
      data-slot="media-player-time"
      data-variant={variant}
      dir={context.dir}
      {...timeProps}
      className={cn("flex items-center gap-1 text-foreground/80 text-sm", className)}
    >
      <span className="tabular-nums">{times.current}</span>
      <span role="separator" aria-hidden="true" aria-valuenow={0} tabIndex={-1}>
        /
      </span>
      <span className="tabular-nums">{times.duration}</span>
    </TimePrimitive>
  );
}

interface MediaPlayerPlaybackSpeedProps
  extends
    ComponentProps<typeof DropdownMenuTrigger>,
    ComponentProps<typeof Button>,
    Omit<ComponentProps<typeof DropdownMenu>, "dir">,
    Pick<ComponentProps<typeof DropdownMenuContent>, "sideOffset"> {
  speeds?: number[];
}

function MediaPlayerPlaybackSpeed(props: MediaPlayerPlaybackSpeedProps) {
  const {
    open,
    defaultOpen,
    onOpenChange: onOpenChangeProp,
    sideOffset = FLOATING_MENU_SIDE_OFFSET,
    speeds = SPEEDS,
    modal = false,
    className,
    disabled,
    ...playbackSpeedProps
  } = props;

  const context = useMediaPlayerContext(PLAYBACK_SPEED_NAME);
  const store = useStoreContext(PLAYBACK_SPEED_NAME);
  const dispatch = useMediaDispatch();
  const mediaPlaybackRate = useMediaSelector((state) => state.mediaPlaybackRate ?? 1);

  const isDisabled = disabled || context.disabled;

  const onPlaybackRateChange = useMemoizedFn((rate: number) => {
    dispatch({
      type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: rate,
    });
  });

  const onOpenChange = useMemoizedFn((open: boolean) => {
    store.setState("menuOpen", open);
    onOpenChangeProp?.(open);
  });

  return (
    <DropdownMenu modal={modal} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <MediaPlayerTooltip tooltip="Playback speed" shortcut={["<", ">"]}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-controls={context.mediaId}
            disabled={isDisabled}
            {...playbackSpeedProps}
            variant="ghost"
            size="icon"
            className={cn("h-8 w-16 aria-expanded:bg-accent/50", className)}
          >
            {mediaPlaybackRate}x
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent
        container={context.portalContainer}
        sideOffset={sideOffset}
        align="center"
        className="min-w-(--radix-dropdown-menu-trigger-width) data-[side=top]:mb-3.5"
      >
        {speeds.map((speed) => (
          <DropdownMenuItem
            key={speed}
            className="justify-between"
            onSelect={() => onPlaybackRateChange(speed)}
          >
            {speed}x{mediaPlaybackRate === speed && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerLoopProps extends ComponentProps<typeof Button> {}

function MediaPlayerLoop(props: MediaPlayerLoopProps) {
  const { children, className, disabled, ...loopProps } = props;

  const context = useMediaPlayerContext("MediaPlayerLoop");
  const isDisabled = disabled || context.disabled;

  const [isLooping, setIsLooping] = useState(() => {
    const mediaElement = context.mediaRef.current;
    return mediaElement?.loop ?? false;
  });

  // The loop flag can be toggled by keyboard shortcuts, so observe the media element attribute.
  useEffect(() => {
    const mediaElement = context.mediaRef.current;
    if (!mediaElement) return;

    setIsLooping(mediaElement.loop);

    const checkLoop = () => setIsLooping(mediaElement.loop);
    const observer = new MutationObserver(checkLoop);
    observer.observe(mediaElement, {
      attributes: true,
      attributeFilter: ["loop"],
    });

    return () => observer.disconnect();
  }, [context.mediaRef]);

  const onLoopToggle = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);
    if (event.defaultPrevented) return;

    const mediaElement = context.mediaRef.current;
    if (mediaElement) {
      const newLoopState = !mediaElement.loop;
      mediaElement.loop = newLoopState;
      setIsLooping(newLoopState);
    }
  });

  return (
    <MediaPlayerTooltip tooltip={isLooping ? "Disable loop" : "Enable loop"} shortcut="R">
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={isLooping ? "Disable loop" : "Enable loop"}
        aria-pressed={isLooping}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-loop"
        data-state={isLooping ? "on" : "off"}
        disabled={isDisabled}
        {...loopProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onLoopToggle}
      >
        {children ?? (isLooping ? <Repeat className="text-muted-foreground" /> : <Repeat />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerFullscreenProps extends ComponentProps<typeof Button> {}

function MediaPlayerFullscreen(props: MediaPlayerFullscreenProps) {
  const { children, className, disabled, ...fullscreenProps } = props;

  const context = useMediaPlayerContext("MediaPlayerFullscreen");
  const dispatch = useMediaDispatch();
  const isFullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false);

  const isDisabled = disabled || context.disabled;

  const onFullscreen = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: isFullscreen
        ? MediaActionTypes.MEDIA_EXIT_FULLSCREEN_REQUEST
        : MediaActionTypes.MEDIA_ENTER_FULLSCREEN_REQUEST,
    });
  });

  return (
    <MediaPlayerTooltip tooltip="Fullscreen" shortcut="F">
      <Button
        type="button"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-fullscreen"
        data-state={isFullscreen ? "on" : "off"}
        disabled={isDisabled}
        {...fullscreenProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onFullscreen}
      >
        {children ?? (isFullscreen ? <Minimize2 /> : <Maximize2 />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerPiPProps extends Omit<ComponentProps<typeof Button>, "children"> {
  children?: ReactNode | ((isPictureInPicture: boolean) => ReactNode);
  onPipError?: (error: unknown, state: "enter" | "exit") => void;
}

function MediaPlayerPiP(props: MediaPlayerPiPProps) {
  const { children, className, onPipError, disabled, ...pipButtonProps } = props;

  const context = useMediaPlayerContext("MediaPlayerPiP");
  const dispatch = useMediaDispatch();
  const isPictureInPicture = useMediaSelector((state) => state.mediaIsPip ?? false);

  const isDisabled = disabled || context.disabled;

  const onPictureInPicture = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: isPictureInPicture
        ? MediaActionTypes.MEDIA_EXIT_PIP_REQUEST
        : MediaActionTypes.MEDIA_ENTER_PIP_REQUEST,
    });

    const mediaElement = context.mediaRef.current;

    if (mediaElement instanceof HTMLVideoElement) {
      if (isPictureInPicture) {
        document.exitPictureInPicture().catch((error) => {
          onPipError?.(error, "exit");
        });
      } else {
        mediaElement.requestPictureInPicture().catch((error) => {
          onPipError?.(error, "enter");
        });
      }
    }
  });

  return (
    <MediaPlayerTooltip tooltip="Picture in picture" shortcut="P">
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={isPictureInPicture ? "Exit pip" : "Enter pip"}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-pip"
        data-state={isPictureInPicture ? "on" : "off"}
        disabled={isDisabled}
        {...pipButtonProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onPictureInPicture}
      >
        {typeof children === "function"
          ? children(isPictureInPicture)
          : (children ?? (isPictureInPicture ? <PictureInPicture2 /> : <PictureInPicture />))}
      </Button>
    </MediaPlayerTooltip>
  );
}

function MediaPlayerCaptions(props: ComponentProps<typeof Button>) {
  const { children, className, disabled, ...captionsProps } = props;

  const context = useMediaPlayerContext("MediaPlayerCaptions");
  const dispatch = useMediaDispatch();
  const isSubtitlesActive = useMediaSelector(
    (state) => (state.mediaSubtitlesShowing ?? []).length > 0
  );

  const isDisabled = disabled || context.disabled;
  const onCaptionsToggle = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    dispatch({
      type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
    });
  });

  return (
    <MediaPlayerTooltip tooltip="Captions" shortcut="C">
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label={isSubtitlesActive ? "Disable captions" : "Enable captions"}
        aria-pressed={isSubtitlesActive}
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-captions"
        data-state={isSubtitlesActive ? "on" : "off"}
        disabled={isDisabled}
        {...captionsProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onCaptionsToggle}
      >
        {children ?? (isSubtitlesActive ? <Subtitles /> : <CaptionsOff />)}
      </Button>
    </MediaPlayerTooltip>
  );
}

function MediaPlayerDownload(props: ComponentProps<typeof Button>) {
  const { children, className, disabled, ...downloadProps } = props;

  const context = useMediaPlayerContext("MediaPlayerDownload");

  const isDisabled = disabled || context.disabled;

  const onDownload = useMemoizedFn((event: MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(event);

    if (event.defaultPrevented) return;

    const mediaElement = context.mediaRef.current;

    if (!mediaElement || !mediaElement.currentSrc) return;

    const link = document.createElement("a");
    link.href = mediaElement.currentSrc;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  return (
    <MediaPlayerTooltip tooltip="Download" shortcut="D">
      <Button
        type="button"
        aria-controls={context.mediaId}
        aria-label="Download"
        data-disabled={isDisabled ? "" : undefined}
        data-slot="media-player-download"
        disabled={isDisabled}
        {...downloadProps}
        variant="ghost"
        size="icon"
        className={cn("size-8", className)}
        onClick={onDownload}
      >
        {children ?? <Download />}
      </Button>
    </MediaPlayerTooltip>
  );
}

interface MediaPlayerSettingsProps extends MediaPlayerPlaybackSpeedProps {}

function MediaPlayerSettings(props: MediaPlayerSettingsProps) {
  const {
    open,
    defaultOpen,
    onOpenChange: onOpenChangeProp,
    sideOffset = FLOATING_MENU_SIDE_OFFSET,
    speeds = SPEEDS,
    modal = false,
    className,
    disabled,
    ...settingsProps
  } = props;

  const context = useMediaPlayerContext(SETTINGS_NAME);
  const store = useStoreContext(SETTINGS_NAME);
  const dispatch = useMediaDispatch();

  const mediaPlaybackRate = useMediaSelector((state) => state.mediaPlaybackRate ?? 1);
  const mediaSubtitlesList = useMediaSelector((state) => state.mediaSubtitlesList ?? []);
  const mediaSubtitlesShowing = useMediaSelector((state) => state.mediaSubtitlesShowing ?? []);
  const mediaRenditionList = useMediaSelector((state) => state.mediaRenditionList ?? []);
  const selectedRenditionId = useMediaSelector((state) => state.mediaRenditionSelected);

  const isDisabled = disabled || context.disabled;
  const isSubtitlesActive = mediaSubtitlesShowing.length > 0;

  const onPlaybackRateChange = useMemoizedFn((rate: number) => {
    dispatch({
      type: MediaActionTypes.MEDIA_PLAYBACK_RATE_REQUEST,
      detail: rate,
    });
  });

  const onRenditionChange = useMemoizedFn((renditionId: string) => {
    dispatch({
      type: MediaActionTypes.MEDIA_RENDITION_REQUEST,
      detail: renditionId === "auto" ? undefined : renditionId,
    });
  });

  const onSubtitlesToggle = useMemoizedFn(() => {
    dispatch({
      type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
      detail: false,
    });
  });

  const onShowSubtitleTrack = useMemoizedFn(
    (subtitleTrack: (typeof mediaSubtitlesList)[number]) => {
      dispatch({
        type: MediaActionTypes.MEDIA_TOGGLE_SUBTITLES_REQUEST,
        detail: false,
      });
      dispatch({
        type: MediaActionTypes.MEDIA_SHOW_SUBTITLES_REQUEST,
        detail: subtitleTrack,
      });
    }
  );

  const selectedSubtitleLabel = getSelectedSubtitleLabel(isSubtitlesActive, mediaSubtitlesShowing);
  const selectedRenditionLabel = getSelectedRenditionLabel(selectedRenditionId, mediaRenditionList);

  const onOpenChange = useMemoizedFn((open: boolean) => {
    store.setState("menuOpen", open);
    onOpenChangeProp?.(open);
  });

  return (
    <DropdownMenu modal={modal} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <MediaPlayerTooltip tooltip="Settings">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-controls={context.mediaId}
            aria-label="Settings"
            data-disabled={isDisabled ? "" : undefined}
            data-slot="media-player-settings"
            disabled={isDisabled}
            {...settingsProps}
            variant="ghost"
            size="icon"
            className={cn("size-8 aria-expanded:bg-accent/50", className)}
          >
            <Settings />
          </Button>
        </DropdownMenuTrigger>
      </MediaPlayerTooltip>
      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={sideOffset}
        container={context.portalContainer}
        className="w-56 data-[side=top]:mb-3.5"
      >
        <DropdownMenuLabel className="sr-only">Settings</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Speed</span>
            <Badge variant="outline" className="rounded-sm">
              {mediaPlaybackRate}x
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {speeds.map((speed) => (
              <DropdownMenuItem
                key={speed}
                className="justify-between"
                onSelect={() => onPlaybackRateChange(speed)}
              >
                {speed}x{mediaPlaybackRate === speed && <Check />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {context.isVideo && mediaRenditionList.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span className="flex-1">Quality</span>
              <Badge variant="outline" className="rounded-sm">
                {selectedRenditionLabel}
              </Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="justify-between"
                onSelect={() => onRenditionChange("auto")}
              >
                Auto
                {!selectedRenditionId && <Check />}
              </DropdownMenuItem>
              {mediaRenditionList
                .slice()
                .sort((a, b) => {
                  const aHeight = a.height ?? 0;
                  const bHeight = b.height ?? 0;
                  return bHeight - aHeight;
                })
                .map((rendition) => {
                  const label = rendition.height
                    ? `${rendition.height}p`
                    : rendition.width
                      ? `${rendition.width}p`
                      : (rendition.id ?? "Unknown");

                  const selected = rendition.id === selectedRenditionId;

                  return (
                    <DropdownMenuItem
                      key={rendition.id}
                      className="justify-between"
                      onSelect={() => onRenditionChange(rendition.id ?? "")}
                    >
                      {label}
                      {selected && <Check />}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex-1">Captions</span>
            <Badge variant="outline" className="rounded-sm">
              {selectedSubtitleLabel}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem className="justify-between" onSelect={onSubtitlesToggle}>
              Off
              {!isSubtitlesActive && <Check />}
            </DropdownMenuItem>
            {mediaSubtitlesList.map((subtitleTrack) => {
              const isSelected = mediaSubtitlesShowing.some(
                (showingSubtitle) => showingSubtitle.label === subtitleTrack.label
              );
              return (
                <DropdownMenuItem
                  key={`${subtitleTrack.kind}-${subtitleTrack.label}-${subtitleTrack.language}`}
                  className="justify-between"
                  onSelect={() => onShowSubtitleTrack(subtitleTrack)}
                >
                  {subtitleTrack.label}
                  {isSelected && <Check />}
                </DropdownMenuItem>
              );
            })}
            {mediaSubtitlesList.length === 0 && (
              <DropdownMenuItem disabled>No captions available</DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MediaPlayerPortalProps {
  container?: Element | DocumentFragment | null;
  children?: ReactNode;
}

function MediaPlayerPortal(props: MediaPlayerPortalProps) {
  const { container: containerProp, children } = props;

  const context = useMediaPlayerContext("MediaPlayerPortal");
  const container = containerProp ?? context.portalContainer;

  if (!container) return null;

  return createPortal(children, container);
}

interface MediaPlayerTooltipProps
  extends
    ComponentProps<typeof Tooltip>,
    Pick<ComponentProps<typeof TooltipContent>, "sideOffset"> {
  tooltip?: string;
  shortcut?: string | string[];
}

function MediaPlayerTooltip(props: MediaPlayerTooltipProps) {
  const { tooltip, shortcut, delayDuration, sideOffset, children, ...tooltipProps } = props;

  const context = useMediaPlayerContext("MediaPlayerTooltip");
  const tooltipDelayDuration = delayDuration ?? context.tooltipDelayDuration;
  const tooltipSideOffset = sideOffset ?? context.tooltipSideOffset;

  if ((!tooltip && !shortcut) || context.withoutTooltip) return <>{children}</>;

  return (
    <Tooltip {...tooltipProps} delayDuration={tooltipDelayDuration}>
      <TooltipTrigger className="text-foreground focus-visible:ring-ring/50" asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent
        container={context.portalContainer}
        sideOffset={tooltipSideOffset}
        className="flex items-center gap-2 border bg-popover px-2 py-1 font-medium text-popover-foreground data-[side=top]:mb-3.5 [&>span]:hidden"
      >
        <p>{tooltip}</p>
        {Array.isArray(shortcut) ? (
          <div className="flex items-center gap-1">
            {shortcut.map((shortcutKey) => (
              <kbd
                key={shortcutKey}
                className="select-none rounded border bg-secondary px-1.5 py-0.5 font-mono text-[11.2px] text-foreground shadow-xs"
              >
                <abbr title={shortcutKey} className="no-underline">
                  {shortcutKey}
                </abbr>
              </kbd>
            ))}
          </div>
        ) : (
          shortcut && (
            <kbd
              key={shortcut}
              className="select-none rounded border bg-secondary px-1.5 py-px font-mono text-[11.2px] text-foreground shadow-xs"
            >
              <abbr title={shortcut} className="no-underline">
                {shortcut}
              </abbr>
            </kbd>
          )
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  MediaPlayer,
  MediaPlayerAudio,
  MediaPlayerCaptions,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerDownload,
  MediaPlayerError,
  MediaPlayerFullscreen,
  MediaPlayerLoading,
  MediaPlayerLoop,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerPortal,
  //
  type MediaPlayerProps,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerSettings,
  MediaPlayerTime,
  MediaPlayerTooltip,
  MediaPlayerVideo,
  MediaPlayerVolume,
  MediaPlayerVolumeIndicator,
  //
  useMediaSelector as useMediaPlayer,
  useStore as useMediaPlayerStore,
};
