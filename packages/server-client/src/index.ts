import type { SolanaClient, SolanaClientConfig } from '@solana/client';
import { type ClusterMoniker, createClient, resolveCluster } from '@solana/client';

export * from '@solana/client/server';
export type { ClusterMoniker };

type ClusterUrl = SolanaClientConfig['endpoint'];

type ResolvedClusterExtras = Readonly<{
	endpoint: ClusterUrl;
	moniker: ClusterMoniker | 'custom';
	websocketEndpoint: ClusterUrl;
}>;

export type ServerClient = SolanaClient & ResolvedClusterExtras;

export type ServerClientConfig = Omit<SolanaClientConfig, 'endpoint' | 'websocketEndpoint'> &
	Readonly<{
		endpoint?: ClusterUrl;
		moniker?: ClusterMoniker;
		websocketEndpoint?: ClusterUrl;
	}>;

export function createServerClient(config: ServerClientConfig): ServerClient {
	const resolved = resolveCluster({
		endpoint: config.endpoint,
		moniker: config.moniker,
		websocketEndpoint: config.websocketEndpoint,
	});
	const client = createClient({
		...config,
		endpoint: resolved.endpoint,
		websocketEndpoint: resolved.websocketEndpoint,
	});
	return {
		...client,
		endpoint: resolved.endpoint,
		moniker: resolved.moniker,
		websocketEndpoint: resolved.websocketEndpoint,
	};
}
