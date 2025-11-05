# Vanilla Vite Playground

This example shows how to consume `@solana/client-core` from a lightweight Vite + vanilla JavaScript project.

## Quick start

```bash
pnpm install
pnpm --filter @solana/example-client-core-vanilla dev
```

Then open <http://localhost:5173>. Connect any Wallet Standard provider first; once authorized, the demo auto-loads your primary account and keeps its balance updated in real time.

## What’s inside

- `createClient` boots with devnet defaults and the set of connectors discovered through `getWalletStandardConnectors()`.
- Wallet buttons call `client.actions.connectWallet`, after which the balance form is unlocked and pre-filled with the connected account address.
- The form reuses `client.actions.fetchBalance` plus `client.watchers.watchBalance` for the live balance stream, while cluster status is driven by `client.store.subscribe`.
- A SOL transfer panel showcases `createSolTransferHelper`, while the SPL section uses `createSplTokenHelper` for ATA derivation, balance fetching, and token transfers. The math playground highlights lamport and bigint helpers.

Feel free to tweak the UI to test other client features (sending transactions, requesting airdrops, etc.).
