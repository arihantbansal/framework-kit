import type { WalletConnector } from '@solana/client-core';
import { useConnectWallet, useDisconnectWallet, useWallet, useWalletSession } from '@solana/react-hooks';
import { useCallback } from 'react';

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return JSON.stringify(error);
}

type Props = Readonly<{
    connectors: readonly WalletConnector[];
}>;

export function WalletControls({ connectors }: Props) {
    const wallet = useWallet();
    const session = useWalletSession();
    const connectWallet = useConnectWallet();
    const disconnectWallet = useDisconnectWallet();

    const handleConnect = useCallback(
        async (connectorId: string) => {
            try {
                await connectWallet(connectorId);
            } catch {
                // Store will expose the error state; nothing else to do here.
            }
        },
        [connectWallet],
    );

    const handleDisconnect = useCallback(async () => {
        try {
            await disconnectWallet();
        } catch {
            // Store already captures the error in wallet state.
        }
    }, [disconnectWallet]);

    const activeConnectorId =
        wallet.status === 'connected' || wallet.status === 'connecting' ? wallet.connectorId : undefined;

    let statusLabel = 'No wallet connected.';
    if (wallet.status === 'connected') {
        statusLabel = `Connected to ${wallet.connectorId}: ${wallet.session.account.address.toString()}`;
    } else if (wallet.status === 'connecting') {
        statusLabel = `Connecting to ${wallet.connectorId}…`;
    } else if (wallet.status === 'error') {
        statusLabel = `Error connecting to ${wallet.connectorId ?? 'wallet'}.`;
    }

    const error =
        wallet.status === 'error' && wallet.error ? formatError(wallet.error) : null;

    return (
        <section className="card">
            <h2>Wallets</h2>
            <p>
                Discover Wallet Standard connectors, connect with wallet actions, and disconnect with a single helper call.
            </p>
            <div className="row" aria-live="polite">
                {connectors.length === 0 ? <span>No Wallet Standard providers detected.</span> : null}
                {connectors.map(connector => {
                    const isActive = wallet.status === 'connected' && connector.id === activeConnectorId;
                    const isBusy = wallet.status === 'connecting' && connector.id === activeConnectorId;
                    return (
                        <button
                            key={connector.id}
                            disabled={isActive || isBusy}
                            onClick={() => handleConnect(connector.id)}
                            title={connector.name}
                            type="button"
                        >
                            {isActive ? `✓ ${connector.name}` : connector.name}
                        </button>
                    );
                })}
            </div>
            {session ? (
                <div className="row">
                    <button
                        disabled={wallet.status === 'connecting'}
                        onClick={handleDisconnect}
                        type="button"
                    >
                        Disconnect
                    </button>
                </div>
            ) : null}
            <p>{statusLabel}</p>
            {error ? <div className="tag error">{error}</div> : null}
        </section>
    );
}
