import { createClient } from '@solana/client-core';

/**
 * Creates a Solana client instance.
 *
 * @param {object} config - Client configuration
 * @param {string} config.endpoint - RPC endpoint URL
 * @param {string} config.websocketEndpoint - WebSocket endpoint URL
 * @param {string} [config.commitment='confirmed'] - Transaction commitment level
 * @param {Array} config.walletConnectors - Wallet connector instances
 * @returns {object} Client instance with store, actions, and watchers
 */
export function setupClient({ endpoint, websocketEndpoint, commitment = 'confirmed', walletConnectors }) {
    const client = createClient({
        commitment,
        endpoint,
        websocketEndpoint,
        walletConnectors,
    });
    return client;
}

/**
 * Subscribe to cluster status changes.
 *
 * @param {object} client - Client instance
 * @param {Function} callback - Called with cluster status whenever it changes
 * @returns {Function} Unsubscribe function
 */
export function watchClusterStatus(client, callback) {
    return client.store.subscribe((state) => {
        callback(state.cluster.status);
    });
}

/**
 * Get current cluster status.
 *
 * @param {object} client - Client instance
 * @returns {object} Current cluster status
 */
export function getClusterStatus(client) {
    return client.store.getState().cluster.status;
}
