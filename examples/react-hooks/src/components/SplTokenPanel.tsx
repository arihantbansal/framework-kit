import { useSplToken, useWalletSession } from '@solana/react-hooks';
import { FormEvent, useState } from 'react';

import { computeSplAmountStep, formatSplBalanceStatus, formatSplTransferStatus } from './demoUi';

const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export function SplTokenPanel() {
    const session = useWalletSession();
    const defaultAmount = '0.01';
    const [destinationOwner, setDestinationOwner] = useState('');
    const [amount, setAmount] = useState(defaultAmount);
    const {
        balance,
        error,
        isFetching,
        isSending,
        owner,
        refresh,
        refreshing,
        resetSend,
        send,
        sendError,
        sendSignature,
        sendStatus,
        status,
    } = useSplToken(DEVNET_USDC_MINT);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session) {
            return;
        }
        const destination = destinationOwner.trim();
        const amountInput = amount.trim();
        if (!destination || !amountInput) {
            return;
        }
        await send({
            amount: amountInput,
            destinationOwner: destination,
        });
        setAmount(defaultAmount);
    };

    const balanceStatus = formatSplBalanceStatus({
        balance,
        error,
        isFetching,
        owner,
        status,
    });
    const transferStatus = formatSplTransferStatus({
        error: sendError,
        isSending,
        owner,
        signature: sendSignature,
        status: sendStatus,
    });

    const isWalletConnected = Boolean(owner);

    const amountStep = computeSplAmountStep(balance?.decimals);

    return (
        <section aria-disabled={!isWalletConnected} className="card">
            <h2>USDC (Devnet)</h2>
            <p>Mint: {DEVNET_USDC_MINT}</p>
            <p>Owner: {owner ?? 'Connect a wallet'}</p>
            <div className="row">
                <button disabled={!isWalletConnected || refreshing} onClick={() => void refresh()} type="button">
                    {refreshing ? 'Refreshing…' : 'Refresh Balance'}
                </button>
            </div>
            <div className="log">{balanceStatus}</div>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={!isWalletConnected}>
                    <label>
                        Destination Owner
                        <input
                            autoComplete="off"
                            disabled={!owner}
                            onChange={event => setDestinationOwner(event.target.value)}
                            placeholder="Base58 address"
                            value={destinationOwner}
                        />
                    </label>
                    <label>
                        Amount (UI)
                        <input
                            autoComplete="off"
                            min="0"
                            onChange={event => setAmount(event.target.value)}
                            placeholder={defaultAmount}
                            step={amountStep}
                            type="number"
                            value={amount}
                        />
                    </label>
                    <div className="row">
                        <button disabled={!owner || isSending} type="submit">
                            {isSending ? 'Sending…' : 'Send USDC'}
                        </button>
                        <button disabled={sendStatus === 'idle'} onClick={resetSend} type="button">
                            Reset
                        </button>
                    </div>
                </fieldset>
            </form>
            <div className="log">{transferStatus}</div>
        </section>
    );
}
