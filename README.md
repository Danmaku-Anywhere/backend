# Danmaku Anywhere backend

Cloudflare Worker for [Danmaku Anywhere](https://github.com/Danmaku-Anywhere/danmaku-anywhere): DDP proxy, auth, LLM features and the manifest catalog, on Hono with D1.

Run `pnpm install` and `pnpm dev` for a local server; the other scripts are in `package.json`.

Staging (api.danmaku-staging.weeblify.app) deploys from `master` through Cloudflare Workers Builds. Production (api.danmaku.weeblify.app) is deployed by hand.
