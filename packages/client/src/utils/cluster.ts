import type { ClusterUrl } from '@solana/kit';

export type ClusterMoniker = 'mainnet' | 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet' | 'localhost';

type ResolvedCluster = Readonly<{
	endpoint: ClusterUrl;
	moniker: ClusterMoniker | 'custom';
	websocketEndpoint: ClusterUrl;
}>;

const MONIKER_ENDPOINTS: Record<ClusterMoniker, Readonly<{ endpoint: ClusterUrl; websocketEndpoint: ClusterUrl }>> = {
	devnet: {
		endpoint: 'https://api.devnet.solana.com',
		websocketEndpoint: 'wss://api.devnet.solana.com',
	},
	localhost: {
		endpoint: 'http://127.0.0.1:8899',
		websocketEndpoint: 'ws://127.0.0.1:8900',
	},
	localnet: {
		endpoint: 'http://127.0.0.1:8899',
		websocketEndpoint: 'ws://127.0.0.1:8900',
	},
	'mainnet-beta': {
		endpoint: 'https://api.mainnet-beta.solana.com',
		websocketEndpoint: 'wss://api.mainnet-beta.solana.com',
	},
	mainnet: {
		endpoint: 'https://api.mainnet-beta.solana.com',
		websocketEndpoint: 'wss://api.mainnet-beta.solana.com',
	},
	testnet: {
		endpoint: 'https://api.testnet.solana.com',
		websocketEndpoint: 'wss://api.testnet.solana.com',
	},
};

function inferWebsocketEndpoint(endpoint: ClusterUrl): ClusterUrl {
	if (endpoint.startsWith('https://')) {
		return endpoint.replace('https://', 'wss://') as ClusterUrl;
	}
	if (endpoint.startsWith('http://')) {
		return endpoint.replace('http://', 'ws://') as ClusterUrl;
	}
	return endpoint;
}

export function resolveCluster(
	config: Readonly<{ endpoint?: ClusterUrl; moniker?: ClusterMoniker; websocketEndpoint?: ClusterUrl }>,
): ResolvedCluster {
	const moniker = config.moniker ?? (config.endpoint ? 'custom' : 'devnet');
	const mapped = moniker === 'custom' ? undefined : MONIKER_ENDPOINTS[moniker];
	const endpoint = (config.endpoint ?? mapped?.endpoint) as ClusterUrl;
	const websocketEndpoint = (config.websocketEndpoint ??
		mapped?.websocketEndpoint ??
		inferWebsocketEndpoint(endpoint)) as ClusterUrl;
	return {
		endpoint,
		moniker,
		websocketEndpoint,
	};
}
