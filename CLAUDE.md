# CLAUDE.md

Cloudflare Workers backend for [Danmaku Anywhere](https://github.com/Danmaku-Anywhere/danmaku-anywhere): API proxying, auth, LLM features, integration policies and Kazumi rules, on Hono with D1. Conventions and gotchas are in `AGENTS.md`.

## Layout

- The Worker is the repo root (`src/`, `wrangler.json`). Its Cloudflare name stays `danmaku-anywhere-proxy`; custom domains and service bindings point at it.
- `@danmaku-anywhere/integration-policy` is installed from npm. It is built and published from the `Danmaku-Anywhere/danmaku-anywhere` monorepo, so changes to it go there first. The extension reads policies this Worker serves, and installed extensions can be older or newer than it.

## Commands

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Dev server | `pnpm dev` |
| Type check | `pnpm type-check` |
| Lint and fix | `pnpm lint` |
| Tests | `pnpm test` |
| D1 migrations | `pnpm drizzle:generate`, then `pnpm db:migrate:staging` / `pnpm db:migrate:prod` |

## Style

Biome formats and lints (`biome.json`): single quotes, no semicolons, 2 spaces. pnpm only, never npm or yarn. PR titles follow `(proxy) description [DA-123]`.
