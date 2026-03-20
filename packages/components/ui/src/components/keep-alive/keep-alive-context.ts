import { createContext, useContext } from 'react';
import type { KeepAliveContextValue } from './types';

export const KeepAliveContext = createContext<KeepAliveContextValue>({
	lruCacheRef: null,
});

export function useKeepAliveContext() {
	const context = useContext(KeepAliveContext);
	if (!context) {
		throw new Error("useKeepAliveContext must be used within a KeepAliveRoot");
	}
	return context;
}
