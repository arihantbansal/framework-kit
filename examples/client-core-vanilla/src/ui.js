/**
 * UI rendering utilities - All DOM manipulation in one place
 */

function toErrorMessage(error) {
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}

/**
 * Render cluster connection status.
 */
export function renderClusterStatus(element, status) {
    switch (status.status) {
        case 'connecting':
            element.textContent = 'Connecting to cluster…';
            break;
        case 'ready': {
            const latency = status.latencyMs ? `${status.latencyMs} ms` : 'unknown latency';
            element.textContent = `Connected (latency ${latency})`;
            break;
        }
        case 'error':
            element.textContent = `Connection error: ${toErrorMessage(status.error)}`;
            break;
        default:
            element.textContent = 'Idle';
    }
}

/**
 * Render wallet connection buttons.
 */
export function renderWalletButtons(container, wallets, connectedWallet, onConnect) {
    container.innerHTML = '';

    wallets.forEach((wallet) => {
        const button = document.createElement('button');
        button.className = 'connector-button';
        button.textContent = wallet.name;
        button.disabled = Boolean(connectedWallet);
        button.addEventListener('click', () => onConnect(wallet.id));
        container.appendChild(button);
    });
}

/**
 * Render wallet status message.
 */
export function renderWalletStatus(element, wallets, connectedWallet) {
    if (!wallets.length) {
        element.textContent = 'Looking for Wallet Standard providers…';
    } else if (connectedWallet) {
        element.textContent = `Connected: ${connectedWallet.address}`;
    } else {
        element.textContent = 'Select a wallet to connect.';
    }
}

/**
 * Render balance display.
 */
export function renderBalance(element, balanceFormatted, isLive = false) {
    const suffix = isLive ? ' (live)' : '';
    element.textContent = balanceFormatted.display + suffix;
}

/**
 * Set form enabled/disabled state.
 */
export function setFormEnabled(form, enabled) {
    form.querySelectorAll('input, button').forEach((element) => {
        element.disabled = !enabled;
    });
}

/**
 * Show loading state in an element.
 */
export function showLoading(element, message) {
    element.textContent = message;
}

/**
 * Show error state in an element.
 */
export function showError(element, error) {
    element.textContent = `Error: ${toErrorMessage(error)}`;
}
