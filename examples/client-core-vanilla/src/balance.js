import { address } from '@solana/kit';

/**
 * Fetch the balance of a Solana address.
 *
 * @param {object} client - Client instance
 * @param {string} addressString - Base58 Solana address
 * @returns {Promise<bigint>} Balance in lamports
 */
export async function fetchBalance(client, addressString) {
    const addr = address(addressString);
    return await client.actions.fetchBalance(addr);
}

/**
 * Watch balance changes for a Solana address.
 *
 * @param {object} client - Client instance
 * @param {string} addressString - Base58 Solana address
 * @param {Function} callback - Called with new balance whenever it changes
 * @returns {object} Watcher with abort() method to stop watching
 */
export function watchBalance(client, addressString, callback) {
    const addr = address(addressString);
    return client.watchers.watchBalance({ address: addr }, callback);
}

/**
 * Format lamports to SOL with proper decimal places.
 *
 * @param {bigint|null} lamports - Balance in lamports
 * @returns {object} Formatted balance object
 */
export function formatBalance(lamports) {
    if (lamports === null) {
        return {
            lamports: null,
            sol: null,
            display: 'Unknown balance',
        };
    }

    const bigIntLamports = BigInt(lamports);
    const solDivisor = 1_000_000_000n;
    const whole = bigIntLamports / solDivisor;
    const fractional = bigIntLamports % solDivisor;
    const fractionalStr =
        fractional === 0n ? '0' : fractional.toString().padStart(9, '0').replace(/0+$/, '');
    const solString = fractional === 0n ? whole.toString() : `${whole}.${fractionalStr}`;

    return {
        lamports: bigIntLamports.toString(),
        sol: solString,
        display: `${bigIntLamports.toString()} lamports (${solString} SOL)`,
    };
}
