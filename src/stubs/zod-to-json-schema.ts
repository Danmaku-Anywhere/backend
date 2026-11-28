// hono-openapi's schema converter imports this only to describe zod v3
// schemas. Every schema here is zod 4, so the import is left to fail and
// the converter falls back to zod's own toJSONSchema.
throw new Error('zod-to-json-schema is not bundled')
