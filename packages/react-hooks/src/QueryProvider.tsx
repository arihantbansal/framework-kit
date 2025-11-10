import type { JSX, ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { type Cache, SWRConfig, type SWRConfiguration } from 'swr';

import { useClientStore } from './useClientStore';

const createCache = (): Cache => new Map<string, unknown>() as Cache;

const DEFAULT_QUERY_CONFIG: SWRConfiguration = Object.freeze({
	dedupingInterval: 1_000,
	focusThrottleInterval: 1_000,
	provider: () => createCache(),
	revalidateOnFocus: false,
	revalidateOnReconnect: true,
});

type SolanaQueryProviderProps = Readonly<{
	children: ReactNode;
	config?: SWRConfiguration;
	resetOnClusterChange?: boolean;
}>;

export function SolanaQueryProvider({
	children,
	config,
	resetOnClusterChange = true,
}: SolanaQueryProviderProps): JSX.Element {
	const cluster = useClientStore((state) => state.cluster);
	const cacheRegistryRef = useRef<Map<string, Cache>>(new Map());
	const cacheKey = resetOnClusterChange ? `${cluster.endpoint}|${cluster.commitment}` : 'global';
	const cache = useMemo<Cache>(() => {
		const registry = cacheRegistryRef.current;
		if (!resetOnClusterChange) {
			const existing = registry.get('global');
			if (existing) {
				return existing;
			}
			const next = createCache();
			registry.set('global', next);
			return next;
		}
		const next = createCache();
		registry.set(cacheKey, next);
		return next;
	}, [cacheKey, resetOnClusterChange]);

	const value = useMemo<SWRConfiguration>(() => {
		const base = {
			...DEFAULT_QUERY_CONFIG,
			...config,
		};
		if (!config?.provider) {
			base.provider = () => cache;
		}
		return base;
	}, [cache, config]);

	return <SWRConfig value={value}>{children}</SWRConfig>;
}
