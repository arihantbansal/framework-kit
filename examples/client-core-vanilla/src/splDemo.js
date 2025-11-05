import { setFormEnabled, showError, showLoading } from './ui.js';

const DEFAULT_WSOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Provides small utilities around {@link createSplTokenHelper}.
 *
 * @param {object} params - Demo wiring configuration.
 * @param {Function} params.getClient - Getter returning the latest client instance.
 * @param {HTMLInputElement} params.mintInput - Mint address input.
 * @param {HTMLInputElement} params.ownerInput - Owner address input.
 * @param {HTMLButtonElement} params.deriveButton - Derive ATA button.
 * @param {HTMLButtonElement} params.balanceButton - Fetch balance button.
 * @param {HTMLElement} params.inspectOutput - Output element for ATA/balance inspections.
 * @param {HTMLFormElement} params.transferForm - SPL transfer form.
 * @param {HTMLInputElement} params.destinationOwnerInput - Destination owner input.
 * @param {HTMLInputElement} params.amountInput - Amount input.
 * @param {HTMLInputElement} params.amountBaseUnitsInput - Checkbox determining unit mode.
 * @param {HTMLInputElement} params.ensureAtaInput - Checkbox toggling ATA creation.
 * @param {HTMLElement} params.transferOutput - Output element for transfer status/results.
 * @returns {{ enable(session: import('@solana/client-core').WalletSession): void, disable(): void }}
 */
export function createSplTokenDemo({
    getClient,
    mintInput,
    ownerInput,
    deriveButton,
    balanceButton,
    inspectOutput,
    transferForm,
    destinationOwnerInput,
    amountInput,
    amountBaseUnitsInput,
    ensureAtaInput,
    transferOutput,
}) {
    let currentSession = null;

    function getMint() {
        const mint = String(mintInput.value ?? '').trim();
        if (!mint) {
            throw new Error('Provide a token mint address.');
        }
        return mint;
    }

    function getHelper() {
        const client = getClient();
        if (!client) {
            throw new Error('Client not initialised yet.');
        }
        return client.splToken({
            mint: getMint(),
        });
    }

    async function handleDeriveAta() {
        try {
            showLoading(inspectOutput, 'Deriving associated token address…');
            const helper = getHelper();
            const owner = String(ownerInput.value ?? '').trim();
            if (!owner) {
                throw new Error('Provide an owner address.');
            }
            const ata = await helper.deriveAssociatedTokenAddress(owner);
            inspectOutput.textContent = `ATA: ${ata.toString()}`;
        } catch (error) {
            showError(inspectOutput, error);
        }
    }

    async function handleFetchBalance() {
        try {
            showLoading(inspectOutput, 'Fetching token balance…');
            const helper = getHelper();
            const owner = String(ownerInput.value ?? '').trim();
            if (!owner) {
                throw new Error('Provide an owner address.');
            }
            const balance = await helper.fetchBalance(owner);
            inspectOutput.textContent = [
                `ATA: ${balance.ataAddress.toString()}`,
                `Decimals: ${balance.decimals}`,
                `Amount: ${balance.amount.toString()}`,
                `UI Amount: ${balance.uiAmount}`,
                `Exists: ${balance.exists ? 'yes' : 'no'}`,
            ].join('\n');
        } catch (error) {
            showError(inspectOutput, error);
        }
    }

    async function handleTransferSubmit(event) {
        event.preventDefault();
        if (!currentSession) {
            showError(transferOutput, new Error('Connect a wallet before sending tokens.'));
            return;
        }

        const destinationOwner = String(destinationOwnerInput.value ?? '').trim();
        const amountRaw = String(amountInput.value ?? '').trim();
        if (!destinationOwner || !amountRaw) {
            showError(transferOutput, new Error('Provide both destination owner and amount.'));
            return;
        }

        try {
            showLoading(transferOutput, 'Preparing SPL transfer…');
            const helper = getHelper();
            const signature = await helper.sendTransfer({
                amount: amountRaw,
                amountInBaseUnits: amountBaseUnitsInput.checked || undefined,
                authority: currentSession,
                destinationOwner,
                ensureDestinationAta: ensureAtaInput.checked,
                sourceOwner: currentSession.account.address.toString(),
            });
            transferOutput.textContent = `Transfer sent! Signature: ${signature.toString()}`;
            transferForm.reset();
            ensureAtaInput.checked = true;
        } catch (error) {
            showError(transferOutput, error);
        }
    }

    deriveButton.addEventListener('click', () => {
        void handleDeriveAta();
    });
    balanceButton.addEventListener('click', () => {
        void handleFetchBalance();
    });
    transferForm.addEventListener('submit', handleTransferSubmit);

    if (!mintInput.value) {
        mintInput.value = DEFAULT_WSOL_MINT;
    }

    function setTransferEnabled(enabled) {
        setFormEnabled(transferForm, enabled);
        if (!enabled) {
            transferForm.reset();
            ensureAtaInput.checked = true;
            amountBaseUnitsInput.checked = false;
        }
    }

    return {
        disable() {
            currentSession = null;
            setTransferEnabled(false);
            destinationOwnerInput.value = '';
            transferOutput.textContent = 'Connect a wallet to enable SPL transfers.';
        },
        enable(session) {
            currentSession = session;
            if (!ownerInput.value) {
                ownerInput.value = session.account.address.toString();
            }
            destinationOwnerInput.value = session.account.address.toString();
            setTransferEnabled(true);
            transferOutput.textContent = 'Ready to send SPL transfers with the connected wallet.';
        },
    };
}
