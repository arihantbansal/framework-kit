/**
 * Main application entry point - wires together SDK logic and UI
 */
import { setupClient, watchClusterStatus, getClusterStatus } from './client.js';
import { getAvailableWallets, watchAvailableWallets, connectWallet, disconnectWallet } from './wallet.js';
import { fetchBalance, watchBalance, formatBalance } from './balance.js';
import { createSolTransferDemo } from './solTransfer.js';
import { createSplTokenDemo } from './splDemo.js';
import { setupMathDemo } from './mathDemo.js';
import {
    renderClusterStatus,
    renderWalletButtons,
    renderWalletStatus,
    renderBalance,
    setFormEnabled,
    showLoading,
    showError,
} from './ui.js';

// Configuration
const CONFIG = {
    endpoint: 'https://api.devnet.solana.com',
    websocketEndpoint: 'wss://api.devnet.solana.com',
    commitment: 'confirmed',
    walletOptions: {
        overrides: (wallet) => ({
            defaultChain: wallet.chains?.[0] ?? 'solana:devnet',
        }),
    },
};

// DOM elements
const clusterStatusElement = document.getElementById('cluster-status');
const walletStatusElement = document.getElementById('wallet-status');
const walletButtonsContainer = document.getElementById('wallet-buttons');
const disconnectButton = document.getElementById('disconnect-button');
const accountForm = document.getElementById('account-form');
const addressInput = document.getElementById('address-input');
const balanceOutputElement = document.getElementById('balance-output');
const solTransferForm = document.getElementById('sol-transfer-form');
const solDestinationInput = document.getElementById('sol-destination-input');
const solAmountInput = document.getElementById('sol-amount-input');
const solTransferOutput = document.getElementById('sol-transfer-output');
const splMintInput = document.getElementById('spl-mint-input');
const splOwnerInput = document.getElementById('spl-owner-input');
const splDeriveButton = document.getElementById('spl-derive-button');
const splBalanceButton = document.getElementById('spl-balance-button');
const splInspectOutput = document.getElementById('spl-inspect-output');
const splTransferForm = document.getElementById('spl-transfer-form');
const splDestinationOwnerInput = document.getElementById('spl-destination-owner-input');
const splAmountInput = document.getElementById('spl-amount-input');
const splAmountBaseUnitsInput = document.getElementById('spl-amount-base-units');
const splEnsureAtaInput = document.getElementById('spl-ensure-ata');
const splTransferOutput = document.getElementById('spl-transfer-output');
const mathForm = document.getElementById('math-form');
const mathExponentInput = document.getElementById('math-exponent-input');
const mathIntegerInput = document.getElementById('math-integer-input');
const mathSolInput = document.getElementById('math-sol-input');
const mathLamportsInput = document.getElementById('math-lamports-input');
const mathOutput = document.getElementById('math-output');

// Application state
let client = null;
let clusterUnsubscribe = null;
let walletWatcherUnsubscribe = null;
let availableWallets = [];
let connectedWallet = null;
let balanceWatcher = null;

const getClient = () => client;

const solTransferDemo = createSolTransferDemo({
    getClient,
    form: solTransferForm,
    destinationInput: solDestinationInput,
    amountInput: solAmountInput,
    outputElement: solTransferOutput,
});
const splTokenDemo = createSplTokenDemo({
    getClient,
    mintInput: splMintInput,
    ownerInput: splOwnerInput,
    deriveButton: splDeriveButton,
    balanceButton: splBalanceButton,
    inspectOutput: splInspectOutput,
    transferForm: splTransferForm,
    destinationOwnerInput: splDestinationOwnerInput,
    amountInput: splAmountInput,
    amountBaseUnitsInput: splAmountBaseUnitsInput,
    ensureAtaInput: splEnsureAtaInput,
    transferOutput: splTransferOutput,
});
setupMathDemo({
    form: mathForm,
    exponentInput: mathExponentInput,
    integerInput: mathIntegerInput,
    solInput: mathSolInput,
    lamportsInput: mathLamportsInput,
    outputElement: mathOutput,
});

solTransferDemo.disable();
splTokenDemo.disable();

/**
 * Initialize client with wallet connectors
 */
function initializeClient(walletConnectors) {
    // Clean up existing client if any
    if (clusterUnsubscribe) {
        clusterUnsubscribe();
        clusterUnsubscribe = null;
    }
    if (client) {
        client.destroy();
    }

    // Create new client
    client = setupClient({
        endpoint: CONFIG.endpoint,
        websocketEndpoint: CONFIG.websocketEndpoint,
        commitment: CONFIG.commitment,
        walletConnectors,
    });

    // Watch cluster status
    clusterUnsubscribe = watchClusterStatus(client, (status) => {
        renderClusterStatus(clusterStatusElement, status);
    });

    // Render initial cluster status
    renderClusterStatus(clusterStatusElement, getClusterStatus(client));
}

/**
 * Update wallet list in UI
 */
function updateWalletList(wallets) {
    availableWallets = wallets;

    renderWalletStatus(walletStatusElement, availableWallets, connectedWallet);
    renderWalletButtons(walletButtonsContainer, availableWallets, connectedWallet, handleWalletConnect);

    // Recreate client with new wallet list if not connected
    if (!connectedWallet) {
        initializeClient(availableWallets);
    }
}

/**
 * Handle wallet connection
 */
async function handleWalletConnect(connectorId) {
    showLoading(walletStatusElement, 'Connecting to wallet…');

    try {
        connectedWallet = await connectWallet(client, connectorId);

        // Update UI
        disconnectButton.disabled = false;
        setFormEnabled(accountForm, true);
        addressInput.value = connectedWallet.address;
        renderWalletStatus(walletStatusElement, availableWallets, connectedWallet);
        renderWalletButtons(walletButtonsContainer, availableWallets, connectedWallet, handleWalletConnect);
        solTransferDemo.enable(connectedWallet.session);
        splTokenDemo.enable(connectedWallet.session);

        // Fetch balance for connected wallet
        showLoading(balanceOutputElement, 'Fetching account balance…');
        await handleBalanceFetch(connectedWallet.address);
    } catch (error) {
        connectedWallet = null;
        disconnectButton.disabled = true;
        setFormEnabled(accountForm, false);
        showError(walletStatusElement, error);
        renderWalletButtons(walletButtonsContainer, availableWallets, connectedWallet, handleWalletConnect);
        balanceOutputElement.textContent = 'Connect a wallet to begin.';
        solTransferDemo.disable();
        splTokenDemo.disable();
    }
}

/**
 * Handle wallet disconnect
 */
async function handleWalletDisconnect() {
    showLoading(walletStatusElement, 'Disconnecting…');
    disconnectButton.disabled = true;

    try {
        await disconnectWallet(client);

        // Clean up balance watcher
        if (balanceWatcher) {
            balanceWatcher.abort();
            balanceWatcher = null;
        }

        // Reset state
        connectedWallet = null;
        addressInput.value = '';
        setFormEnabled(accountForm, false);
        balanceOutputElement.textContent = 'Connect a wallet to begin.';
        solTransferDemo.disable();
        splTokenDemo.disable();

        // Update UI
        renderWalletStatus(walletStatusElement, availableWallets, connectedWallet);
        renderWalletButtons(walletButtonsContainer, availableWallets, connectedWallet, handleWalletConnect);
        walletStatusElement.textContent = 'Wallet disconnected.';
    } catch (error) {
        showError(walletStatusElement, error);
        disconnectButton.disabled = false;
    }
}

/**
 * Fetch and watch balance for an address
 */
async function handleBalanceFetch(addressString) {
    // Stop existing watcher
    if (balanceWatcher) {
        balanceWatcher.abort();
        balanceWatcher = null;
    }

    try {
        // Fetch balance
        const lamports = await fetchBalance(client, addressString);
        const formatted = formatBalance(lamports);
        renderBalance(balanceOutputElement, formatted);

        // Watch for balance updates
        balanceWatcher = watchBalance(client, addressString, (newLamports) => {
            const formatted = formatBalance(newLamports);
            renderBalance(balanceOutputElement, formatted, true);
        });
    } catch (error) {
        showError(balanceOutputElement, error);
    }
}

/**
 * Initialize application
 */
function bootstrap() {
    // Disable form until wallet is connected
    setFormEnabled(accountForm, false);
    balanceOutputElement.textContent = 'Connect a wallet to begin.';

    // Get initial wallets
    const initialWallets = getAvailableWallets(CONFIG.walletOptions);
    updateWalletList(initialWallets);

    // Watch for wallet changes
    walletWatcherUnsubscribe = watchAvailableWallets(updateWalletList, CONFIG.walletOptions);

    // Set up event handlers
    disconnectButton.addEventListener('click', () => {
        void handleWalletDisconnect();
    });

    accountForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(accountForm);
        const rawAddress = String(formData.get('address') ?? '').trim();

        if (!rawAddress) {
            balanceOutputElement.textContent = 'Please provide a valid address.';
            return;
        }

        void handleBalanceFetch(rawAddress);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (balanceWatcher) {
            balanceWatcher.abort();
        }
    });
}

// Start the app
bootstrap();
