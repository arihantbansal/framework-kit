# @solana/example-react-hooks

Demonstrates how to build a React interface with the experimental `@solana/react-hooks` package.

The example mirrors the vanilla proof-of-concept by wiring wallet discovery, SOL transfers, SPL token helpers, and live balance updates through idiomatic React components.

## Developing

```sh
pnpm install
pnpm --filter @solana/example-react-hooks dev
```

The app runs against Devnet by default. Press <kbd>o</kbd> + <kbd>Enter</kbd> in the terminal to open a browser window once Vite starts.

## Building

```sh
pnpm --filter @solana/example-react-hooks build
```

The production bundle is emitted to `dist/`.
