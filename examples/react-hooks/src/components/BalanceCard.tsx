import { lamportsToSolString } from '@solana/client-core';
import { useBalance, useWallet } from '@solana/react-hooks';
import { ChangeEvent, useEffect, useState } from 'react';

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return JSON.stringify(error);
}

function formatLamports(lamports: bigint | null): string {
    return lamports === null ? 'Unknown' : lamports.toString();
}

export function BalanceCard() {
    const wallet = useWallet();
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (wallet.status === 'connected') {
            setAddress(wallet.session.account.address.toString());
        }
    }, [wallet]);

    const trimmedAddress = address.trim();
    const balance = useBalance(trimmedAddress === '' ? undefined : trimmedAddress);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAddress(event.target.value);
    };

    const solDisplay =
        balance.lamports !== null ? `${lamportsToSolString(balance.lamports)} SOL` : 'Balance unavailable.';

    return (
        <section className="card">
            <h2>Account Balance</h2>
            <p>
                Provide an address and <code>useBalance</code> keeps the lamport cache in sync with your client store.
            </p>
            <label>
                Address
                <input
                    autoComplete="off"
                    onChange={handleChange}
                    placeholder="Base58 address"
                    value={address}
                />
            </label>
            <div>
                <div>Lamports: {formatLamports(balance.lamports)}</div>
                <div>SOL: {solDisplay}</div>
                <div>Status: {balance.fetching ? 'Fetching…' : 'Idle'}</div>
                {balance.slot !== undefined && balance.slot !== null ? <div>Slot: {balance.slot.toString()}</div> : null}
            </div>
            {balance.error ? <div className="tag error">{formatError(balance.error)}</div> : null}
        </section>
    );
}
