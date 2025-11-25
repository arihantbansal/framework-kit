import type { SolanaClient } from '@solana/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR, { type BareFetcher, type SWRConfiguration, type SWRResponse } from 'swr';

import { useSolanaClient } from './context';
import { useQuerySuspensePreference } from './querySuspenseContext';
import { useClientStore } from './useClientStore';

const QUERY_NAMESPACE = '@solana/react-hooks';

export type QueryStatus = 'error' | 'idle' | 'loading' | 'success';

export type UseSolanaRpcQueryOptions<Data> = Readonly<{
	disabled?: boolean;
	swr?: Omit<SWRConfiguration<Data, unknown, BareFetcher<Data>>, 'fallback' | 'suspense'>;
}>;

export type SolanaQueryResult<Data> = Readonly<{
	data: Data | undefined;
	dataUpdatedAt?: number;
	error: unknown;
	isError: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	isValidating: boolean;
	mutate: SWRResponse<Data>['mutate'];
	refresh(): Promise<Data | undefined>;
	status: QueryStatus;
}>;

export function useSolanaRpcQuery<Data>(
	scope: string,
	args: readonly unknown[],
	fetcher: (client: SolanaClient) => Promise<Data>,
	options: UseSolanaRpcQueryOptions<Data> = {},
): SolanaQueryResult<Data> {
	const client = useSolanaClient();
	const cluster = useClientStore((state) => state.cluster);
	const { disabled = false, swr } = options;
	const providerSuspensePreference = useQuerySuspensePreference();
	const suspenseEnabled = !disabled && Boolean(providerSuspensePreference);
	const swrOptions: SWRConfiguration<Data, unknown, BareFetcher<Data>> = {
		...(swr ?? {}),
		suspense: suspenseEnabled,
	};

	const key = useMemo(() => {
		if (disabled) {
			return null;
		}
		return [QUERY_NAMESPACE, scope, cluster.endpoint, cluster.commitment, ...args] as const;
	}, [cluster.commitment, cluster.endpoint, args, scope, disabled]);

	const swrResponse = useSWR<Data>(key, () => fetcher(client), swrOptions);
	const [dataUpdatedAt, setDataUpdatedAt] = useState<number | undefined>(() =>
		swrResponse.data !== undefined ? Date.now() : undefined,
	);

	useEffect(() => {
		if (swrResponse.data !== undefined) {
			setDataUpdatedAt(Date.now());
		}
	}, [swrResponse.data]);

	const status: QueryStatus = swrResponse.error
		? 'error'
		: swrResponse.isLoading
			? 'loading'
			: swrResponse.data !== undefined
				? 'success'
				: 'idle';

	const refresh = useCallback(() => swrResponse.mutate(undefined, { revalidate: true }), [swrResponse.mutate]);

	return {
		data: swrResponse.data,
		dataUpdatedAt,
		error: swrResponse.error ?? null,
		isError: status === 'error',
		isLoading: swrResponse.isLoading,
		isSuccess: status === 'success',
		isValidating: swrResponse.isValidating,
		mutate: swrResponse.mutate,
		refresh,
		status,
	};
}
