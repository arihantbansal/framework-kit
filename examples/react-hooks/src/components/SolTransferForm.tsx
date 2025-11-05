import { lamportsMath } from '@solana/client-core';
import { useSolTransfer, useWalletSession } from '@solana/react-hooks';
import { FormEvent, useEffect, useState } from 'react';

import { formatTransferFeedback } from './demoUi';

export function SolTransferForm() {
    const session = useWalletSession();
    const { send, status, signature, error, reset, isSending } = useSolTransfer();

    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('0.01');

    useEffect(() => {
        if (session) {
            setDestination(current => current || session.account.address.toString());
        } else {
            setDestination('');
        }
    }, [session]);

    useEffect(() => {
        if (status === 'success') {
            setAmount('0.01');
        }
    }, [status]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const target = destination.trim();
        const amountInput = amount.trim();
        if (!target || !amountInput) {
            return;
        }
        const lamports = lamportsMath.fromSol(amountInput, { label: 'SOL amount' });
        await send({
            amount: lamports,
            destination: target,
        });
    };

    const feedback = formatTransferFeedback({ error, session, signature, status });

    const isWalletConnected = Boolean(session);

    return (
        <section aria-disabled={!isWalletConnected} className="card">
            <h2>SOL Transfer</h2>
            <p>
                The <code>useSolTransfer</code> hook wraps the underlying helper, manages status, and exposes the latest
                signature so you only worry about form inputs.
            </p>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={!isWalletConnected}>
                    <label>
                        Destination
                        <input
                            autoComplete="off"
                            onChange={event => setDestination(event.target.value)}
                            placeholder="Recipient address"
                            value={destination}
                        />
                    </label>
                    <label>
                        Amount (SOL)
                        <input
                            autoComplete="off"
                            min="0"
                            onChange={event => setAmount(event.target.value)}
                            placeholder="0.01"
                            step="0.0001"
                            type="number"
                            value={amount}
                        />
                    </label>
                    <div className="row">
                        <button disabled={!session || isSending} type="submit">
                            {isSending ? 'Sending…' : 'Send SOL'}
                        </button>
                        <button disabled={status === 'idle'} onClick={reset} type="button">
                            Reset
                        </button>
                    </div>
                </fieldset>
            </form>
            <div className="log">{feedback}</div>
        </section>
    );
}
