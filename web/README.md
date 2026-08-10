# ENS Subname Registrar Website

A bare bones [Vite](https://vite.dev/) + React app that lets users register subnames by signing a message with their wallet, then POSTing that signature to the [Cloudflare Worker](/worker/README.md).

## Run Locally

1. Navigate to this directory: `cd web`
2. Install dependencies: `bun install`
3. Point the app at your gateway: `cp .env.example .env` and set `VITE_GATEWAY_URL` to your Worker's URL (defaults to the hosted demo gateway)
4. Start the dev server: `bun dev`

## Build

`bun run build` typechecks the app and outputs a static site to `dist/`, which can be deployed to any static host.

## Note on `overrides`

`package.json` pins `ws`, `axios`, and `uuid` to patched versions. These aren't used directly — they're transitive dependencies of the wallet connectors that ship with known advisories, and the connectors' own version ranges don't yet pull in the fixes. Drop the `overrides` block once they do.
