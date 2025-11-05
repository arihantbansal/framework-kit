import { lamportsMath } from '@solana/client-core';

import { setFormEnabled, showError, showLoading } from './ui.js';

/**
 * Wires the SOL transfer helper to a simple form-based demo.
 *
 * @param {object} params - Configuration for the demo.
 * @param {Function} params.getClient - Getter returning the latest client instance.
 * @param {HTMLFormElement} params.form - Form element handling submissions.
 * @param {HTMLInputElement} params.destinationInput - Destination address field.
 * @param {HTMLInputElement} params.amountInput - Amount field in SOL units.
 * @param {HTMLElement} params.outputElement - Display element for status/results.
 * @returns {{ enable(session: import('@solana/client-core').WalletSession): void, disable(): void }}
 */
export function createSolTransferDemo({ getClient, form, destinationInput, amountInput, outputElement }) {
    let currentSession = null;

    function resolveHelper() {
        const client = getClient();
        if (!client) {
            throw new Error('Client not initialised yet.');
        }
        return client.solTransfer;
    }

    function updateEnabled(enabled) {
        setFormEnabled(form, enabled);
        if (!enabled) {
            form.reset();
        }
    }

    function renderReady() {
        outputElement.textContent = 'Ready to send SOL transfers with the connected wallet.';
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!currentSession) {
            showError(outputElement, new Error('Connect a wallet before sending SOL.'));
            return;
        }

        const destination = String(destinationInput.value ?? '').trim();
        const amountSol = String(amountInput.value ?? '').trim();
        if (!destination || !amountSol) {
            showError(outputElement, new Error('Provide both destination and amount.'));
            return;
        }

        try {
            showLoading(outputElement, 'Preparing transfer…');
            const lamports = lamportsMath.fromSol(amountSol, { label: 'SOL amount' });
            const activeHelper = resolveHelper();
            const signature = await activeHelper.sendTransfer({
                amount: lamports,
                authority: currentSession,
                destination,
            });
            outputElement.textContent = `Transfer sent! Signature: ${signature.toString()}`;
            form.reset();
        } catch (error) {
            showError(outputElement, error);
        }
    }

    form.addEventListener('submit', handleSubmit);

    return {
        disable() {
            currentSession = null;
            updateEnabled(false);
            outputElement.textContent = 'Connect a wallet to enable SOL transfers.';
        },
        enable(session) {
            currentSession = session;
            updateEnabled(true);
            destinationInput.value = session.account.address.toString();
            renderReady();
        },
    };
}
