# AGENTS.md

## Traps

- Change the D1 schema only through Drizzle migrations: run `pnpm drizzle:generate` after schema changes. D1 is SQLite, so not all SQL features exist.
- Migrations are separate from deploys. Apply them with the `db:migrate:*` scripts in `package.json`.
- The Worker's Cloudflare name stays `danmaku-anywhere-proxy`; custom domains and service bindings point at it.
- `@danmaku-anywhere/integration-policy` comes from npm and is built in the `Danmaku-Anywhere/danmaku-anywhere` monorepo. Change it there first. The extension reads the policies this Worker serves, and installed extensions can be older or newer than the Worker, so keep changes compatible both ways.
- The manifest router (`src/routes/api/manifest/router.ts`) pins a dango tag. New manifests reach users only after the tag is bumped and the Worker redeployed.
- Staging deploys automatically from `master`. Production is not connected to git and is deployed by hand.

## Rules

- pnpm only, never npm or yarn.
- PR titles: `(proxy) <description> [DA-123]`.
- Comments only for what the code cannot say: a hidden constraint, a trap, a workaround. No narration, history or defensive argument.
- No em dashes (U+2014) in code, comments or docs.
