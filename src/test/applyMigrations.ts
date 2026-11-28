import type { D1Migration } from 'cloudflare:test'
import { env } from 'cloudflare:workers'

// TEST_MIGRATIONS is bound by the vitest pool, not by any deployed environment, so it is
// typed here rather than on Cloudflare.Env (which the worker's own Env extends).
const { TEST_MIGRATIONS } = env as typeof env & {
  TEST_MIGRATIONS: D1Migration[]
}

// This does what applyD1Migrations() from cloudflare:test does. Importing
// cloudflare:test in a setup file makes workerd exit before the next test file
// once the worker's import graph is large enough:
// https://github.com/cloudflare/workers-sdk/issues/16331
//
// Setup files run outside isolated storage and may run more than once, so only
// migrations that are not recorded yet are applied.
await env.DB.prepare(
  'CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)'
).run()

const applied = await env.DB.prepare('SELECT name FROM d1_migrations').all<{
  name: string
}>()
const appliedNames = new Set(applied.results.map((row) => row.name))

for (const migration of TEST_MIGRATIONS) {
  if (appliedNames.has(migration.name)) {
    continue
  }
  await env.DB.batch([
    ...migration.queries.map((query) => env.DB.prepare(query)),
    env.DB.prepare('INSERT INTO d1_migrations (name) VALUES (?)').bind(
      migration.name
    ),
  ])
}
