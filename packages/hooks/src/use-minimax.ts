import { useCallback, useEffect, useRef, useState } from "react";

export enum MinimaxState {
	NORMAL = "normal",
	MINIMIZED = "minimized",
	MAXIMIZED = "maximized",
	FULLSCREEN = "fullscreen",
}

export interface MinimaxOptions {
	defaultState?: MinimaxState;
	onClose?: () => void;
	onStateChange?: (state: MinimaxState, previousState: MinimaxState) => void;
	useRequestFullScreen?: boolean;
	fullscreenElement?: HTMLElement | null;
	restoreMode?: "normal" | "previous";
}

export function useMinimax(options: MinimaxOptions = {}) {
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const [state, setState] = useState<MinimaxState>(options.defaultState ?? MinimaxState.NORMAL);
	const [previousState, setPreviousState] = useState<MinimaxState>(MinimaxState.NORMAL);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const stateRef = useRef(state);
	const previousStateRef = useRef(previousState);

	const changeState = useCallback((next: MinimaxState) => {
		const previous = stateRef.current;
		if (previous === next) return;
		previousStateRef.current = previous;
		stateRef.current = next;
		setPreviousState(previous);
		setState(next);
		optionsRef.current.onStateChange?.(next, previous);
	}, []);

	const restore = useCallback(() => {
		const next =
			optionsRef.current.restoreMode === "previous" &&
			previousStateRef.current !== MinimaxState.MINIMIZED &&
			previousStateRef.current !== MinimaxState.FULLSCREEN
				? previousStateRef.current
				: MinimaxState.NORMAL;
		changeState(next);
		if (document.fullscreenElement) {
			document.exitFullscreen?.().catch(console.error);
		}
	}, [changeState]);

	const minimize = useCallback(() => {
		changeState(MinimaxState.MINIMIZED);
	}, [changeState]);

	const maximize = useCallback(async () => {
		if (optionsRef.current.useRequestFullScreen) {
			const element = optionsRef.current.fullscreenElement ?? document.documentElement;
			try {
				await element.requestFullscreen?.();
			} catch (error) {
				console.warn("Failed to enter fullscreen mode:", error);
			}
			return;
		}
		changeState(MinimaxState.MAXIMIZED);
	}, [changeState]);

	const fullscreen = useCallback(async () => {
		const element = optionsRef.current.fullscreenElement ?? document.documentElement;
		try {
			await element.requestFullscreen?.();
		} catch (error) {
			console.warn("Failed to enter fullscreen mode:", error);
		}
	}, []);

	const toggleMaximize = useCallback(() => {
		if (stateRef.current === MinimaxState.MAXIMIZED || stateRef.current === MinimaxState.FULLSCREEN) {
			restore();
		} else {
			void maximize();
		}
	}, [maximize, restore]);

	const close = useCallback(() => {
		optionsRef.current.onClose?.();
	}, []);

	useEffect(() => {
		const handleFullscreenChange = () => {
			const active = !!document.fullscreenElement;
			setIsFullscreen(active);
			if (active) {
				changeState(MinimaxState.FULLSCREEN);
				return;
			}
			if (stateRef.current === MinimaxState.FULLSCREEN) {
				changeState(MinimaxState.NORMAL);
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, [changeState]);

	return {
		state,
		previousState,
		isNormal: state === MinimaxState.NORMAL,
		isMinimized: state === MinimaxState.MINIMIZED,
		isMaximized: state === MinimaxState.MAXIMIZED || state === MinimaxState.FULLSCREEN,
		isFullscreen,
		minimize,
		maximize,
		fullscreen,
		restore,
		toggleMaximize,
		close,
		handleMinimize: minimize,
		handleMaximize: maximize,
		handleRestore: restore,
		handleClose: close,
	};
}
