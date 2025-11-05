import type { ClientState } from '@solana/client-core';
import { useStore } from 'zustand';

import { useSolanaClient } from './context';

type Selector<T> = (state: ClientState) => T;

export function useClientStore(): ClientState;
export function useClientStore<T>(selector: Selector<T>): T;
/**
 * Subscribe to the underlying Zustand store exposed by {@link SolanaClient}.
 *
 * @param selector - Derives the slice of state to observe. Defaults to the entire state.
 * @returns Selected state slice that triggers re-render when it changes.
 */
export function useClientStore<T>(selector?: Selector<T>): ClientState | T {
    const client = useSolanaClient();
    if (selector) {
        return useStore(client.store, selector);
    }
    return useStore(client.store);
}
