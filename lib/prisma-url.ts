// Transaction poolers (PgBouncer transaction mode) drop named prepared statements
// between checkouts, which surfaces as SQLSTATE 26000. `pgbouncer=true` is
// Prisma's switch that sets the statement cache size to 0. A direct Postgres
// URL, such as port 5432 with no pooler host, is returned unchanged.
// Never log these strings: they can contain database credentials.

const POOLER_PORT = "6543";
const POOLER_HOST_MARKER = "pooler";
const PGBOUNCER_PARAM = "pgbouncer";
const PREPARED_STATEMENT_SQLSTATE = "26000";
const PREPARED_STATEMENT_LABEL = "prepared statement";
const MISSING_OBJECT_LABEL = "does not exist";
const PREPARED_STATEMENT_WINDOW = 80;

const PREPARED_STATEMENT_SQLSTATE_MESSAGE = new RegExp(
  `sqlstate\\s*:?\\s*${PREPARED_STATEMENT_SQLSTATE}|code:\\s*["']${PREPARED_STATEMENT_SQLSTATE}["']`,
  "i"
);

export function poolerSafeUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const url = parseDatabaseUrl(raw);
  if (!url || hasPgBouncerEnabled(url) || !isTransactionPooler(url)) return raw;
  url.searchParams.set(PGBOUNCER_PARAM, "true");
  return url.toString();
}

export function isStalePreparedStatement(error: unknown): boolean {
  return matchesStalePreparedStatement(error, 0);
}

function parseDatabaseUrl(raw: string): URL | undefined {
  try {
    return new URL(raw);
  } catch (error) {
    if (error instanceof TypeError) return undefined;
    throw error;
  }
}

function isTransactionPooler(url: URL): boolean {
  return url.port === POOLER_PORT || url.hostname.toLowerCase().includes(POOLER_HOST_MARKER);
}

function hasPgBouncerEnabled(url: URL): boolean {
  return url.searchParams.get(PGBOUNCER_PARAM) === "true";
}

function messageIsStalePreparedStatement(message: string): boolean {
  if (hasMissingPreparedStatement(message)) return true;
  return PREPARED_STATEMENT_SQLSTATE_MESSAGE.test(message);
}

function hasMissingPreparedStatement(message: string): boolean {
  const normalized = message.toLowerCase();
  const statementAt = normalized.indexOf(PREPARED_STATEMENT_LABEL);
  if (statementAt < 0) return false;
  const windowEnd = statementAt + PREPARED_STATEMENT_LABEL.length + PREPARED_STATEMENT_WINDOW;
  return normalized.slice(statementAt, windowEnd).includes(MISSING_OBJECT_LABEL);
}

function matchesStalePreparedStatement(error: unknown, depth: number): boolean {
  if (readErrorCode(error) === PREPARED_STATEMENT_SQLSTATE) return true;
  if (!(error instanceof Error)) return false;
  if (messageIsStalePreparedStatement(error.message)) return true;
  if (depth >= 1) return false;
  return matchesStalePreparedStatement(error.cause, depth + 1);
}

function readErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  const code = (error as { code: unknown }).code;
  return typeof code === "string" ? code : undefined;
}
