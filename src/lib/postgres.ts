import "server-only";

import postgres from "postgres";

const globalForPostgres = globalThis as typeof globalThis & {
  __marketSignalsSql?: postgres.Sql;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING);
}

export function getSql() {
  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured.");
  }

  if (!globalForPostgres.__marketSignalsSql) {
    globalForPostgres.__marketSignalsSql = postgres(connectionString, {
      ssl: "require",
      max: 1,
      prepare: false,
      connect_timeout: 2,
      idle_timeout: 5,
    });
  }

  return globalForPostgres.__marketSignalsSql;
}
