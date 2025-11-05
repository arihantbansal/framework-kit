import { getWalletStandardConnectors, watchWalletStandardConnectors } from '@solana/client-core';

/**
 * Get all available Wallet Standard wallets.
 *
 * @param {object} [options] - Discovery options
 * @param {Function} [options.overrides] - Function to override wallet metadata
 * @returns {Array} Array of wallet connector instances
 */
export function getAvailableWallets(options = {}) {
    return getWalletStandardConnectors(options);
}

/**
 * Watch for wallet registration/unregistration events.
 *
 * @param {Function} callback - Called with updated connector list when wallets change
 * @param {object} [options] - Discovery options
 * @param {Function} [options.overrides] - Function to override wallet metadata
 * @returns {Function} Unsubscribe function
 */
export function watchAvailableWallets(callback, options = {}) {
    return watchWalletStandardConnectors(callback, options);
}

/**
 * Connect to a wallet.
 *
 * @param {object} client - Client instance
 * @param {string} connectorId - ID of the wallet connector to use
 * @returns {Promise<object>} Wallet session with account info
 */
export async function connectWallet(client, connectorId) {
    await client.actions.connectWallet(connectorId);
    const walletState = client.store.getState().wallet;

    if (walletState.status !== 'connected') {
        throw new Error('Wallet connection failed');
    }

    return {
        connectorId: walletState.connectorId,
        address: walletState.session.account.address.toString(),
        account: walletState.session.account,
        session: walletState.session,
    };
}

/**
 * Disconnect the currently connected wallet.
 *
 * @param {object} client - Client instance
 * @returns {Promise<void>}
 */
export async function disconnectWallet(client) {
    await client.actions.disconnectWallet();
}

/**
 * Get current wallet connection state.
 *
 * @param {object} client - Client instance
 * @returns {object} Current wallet state
 */
export function getWalletState(client) {
    return client.store.getState().wallet;
}
