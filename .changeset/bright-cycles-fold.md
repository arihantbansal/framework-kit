---
"@solana/react-hooks": minor
---

Remove the Wallet Standard hook exports in favor of connector-driven flows. `useWalletConnection` prefers client-registered connectors and only falls back to discovery when none are configured; signing is done via connector-provided session methods instead of Wallet Standard packages.
