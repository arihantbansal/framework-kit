import type { SolanaClientConfig } from '@solana/client-core';
import { SolanaClientProvider, useWalletStandardConnectors } from '@solana/react-hooks';
import { useMemo } from 'react';

import { BalanceCard } from './components/BalanceCard.tsx';
import { ClusterStatusCard } from './components/ClusterStatusCard.tsx';
import { SolTransferForm } from './components/SolTransferForm.tsx';
import { SplTokenPanel } from './components/SplTokenPanel.tsx';
import { WalletControls } from './components/WalletControls.tsx';

const DEFAULT_CLIENT_CONFIG: SolanaClientConfig = {
    commitment: 'confirmed',
    endpoint: 'https://api.devnet.solana.com',
    websocketEndpoint: 'wss://api.devnet.solana.com',
};

export default function App() {
    const walletConnectors = useWalletStandardConnectors();

    const clientConfig = useMemo<SolanaClientConfig>(
        () => ({
            ...DEFAULT_CLIENT_CONFIG,
            walletConnectors,
        }),
        [walletConnectors],
    );

    return (
        <SolanaClientProvider config={clientConfig}>
            <div className="app">
                <header>
                    <h1>Solana React Hooks Demo</h1>
                    <p>
                        This example wraps the headless <code>@solana/client-core</code> with a React context provider and
                        showcases the hooks exposed by <code>@solana/react-hooks</code>.
                    </p>
                </header>
                <div className="cards">
                    <ClusterStatusCard />
                    <WalletControls connectors={walletConnectors} />
                    <BalanceCard />
                    <SolTransferForm />
                    <SplTokenPanel />
                </div>
            </div>
        </SolanaClientProvider>
    );
}
