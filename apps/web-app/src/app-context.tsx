import type { EventEmitter } from "ahooks/lib/useEventEmitter";
import { createContext, type ReactNode, use } from "react";

export type AppEventType = "onMenuItemClick";
export interface AppEvent<T> {
	type: AppEventType;
	payload: T;
}
export interface AppContextValue {
	eventBus: EventEmitter<AppEvent<unknown>>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export interface AppProviderProps {
	children: ReactNode;
	eventBus: EventEmitter<AppEvent<unknown>>;
}

export function AppProvider({ children, eventBus }: AppProviderProps) {
	const contextValue: AppContextValue = {
		eventBus,
	};

	return <AppContext value={contextValue}>{children}</AppContext>;
}

export function useAppContext() {
	const context = use(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within a AppProvider");
	}
	return context;
}
