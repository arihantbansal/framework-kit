// @vitest-environment jsdom

import type { WalletConnector } from '@solana/client';
import { getWalletStandardConnectors, watchWalletStandardConnectors } from '@solana/client';
import { describe, expect, it, vi } from 'vitest';

import { renderHookWithClient } from '../test/utils';

import { useWalletConnection } from './ui';

let discoveredConnectors: WalletConnector[] = [];
const unsubscribe = vi.fn();

vi.mock('@solana/client', async () => {
	const actual = await vi.importActual<typeof import('@solana/client')>('@solana/client');
	return {
		...actual,
		getWalletStandardConnectors: vi.fn(() => discoveredConnectors),
		watchWalletStandardConnectors: vi.fn((onChange: typeof unsubscribe, _options?: unknown) => {
			onChange(discoveredConnectors);
			return unsubscribe;
		}),
	};
});

const mockedGet = vi.mocked(getWalletStandardConnectors);
const mockedWatch = vi.mocked(watchWalletStandardConnectors);

function createConnector(id: string): WalletConnector {
	return {
		canAutoConnect: true,
		connect: vi.fn(async () => ({
			account: {
				address: 'Address1111111111111111111111111111111111',
				publicKey: new Uint8Array(),
			},
			connector: { id, name: id },
			disconnect: vi.fn(),
			signMessage: vi.fn(),
		})),
		disconnect: vi.fn(async () => undefined),
		id,
		isSupported: vi.fn(() => true),
		name: `Wallet ${id}`,
	};
}

describe('useWalletConnection', () => {
	it('prefers client-registered connectors over discovery', () => {
		const clientConnectors = [createConnector('phantom')];
		const { result } = renderHookWithClient(() => useWalletConnection(), {
			clientOptions: { connectors: clientConnectors },
		});

		expect(result.current.connectors).toEqual(clientConnectors);
		expect(mockedGet).not.toHaveBeenCalled();
		expect(mockedWatch).not.toHaveBeenCalled();
	});

	it('falls back to Wallet Standard discovery when no connectors are registered', () => {
		discoveredConnectors = [createConnector('discovered-wallet')];

		const { result, unmount } = renderHookWithClient(() => useWalletConnection());

		expect(result.current.connectors).toEqual(discoveredConnectors);
		expect(mockedGet).toHaveBeenCalledTimes(2);
		expect(mockedWatch).toHaveBeenCalledTimes(1);

		unmount();
		expect(unsubscribe).toHaveBeenCalled();
	});
});
