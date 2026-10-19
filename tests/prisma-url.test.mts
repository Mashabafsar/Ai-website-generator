import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { isStalePreparedStatement, poolerSafeUrl } = await import("../lib/prisma-url");

const DIRECT_URL = "postgresql://app:secret@postgres:5432/website_builder?schema=public";
const POOLER_URL = "postgresql://user:secret@db.example.com:6543/website_builder?schema=public";

describe("poolerSafeUrl", () => {
  it("adds pgbouncer=true for a transaction pooler on port 6543", () => {
    const result = poolerSafeUrl(POOLER_URL);
    assert.ok(result);
    const url = new URL(result);
    assert.equal(url.port, "6543");
    assert.equal(url.username, "user");
    assert.equal(url.password, "secret");
    assert.equal(url.pathname, "/website_builder");
    assert.equal(url.searchParams.get("schema"), "public");
    assert.equal(url.searchParams.get("pgbouncer"), "true");
    assert.equal(url.searchParams.getAll("pgbouncer").length, 1);
  });

  it("leaves a direct postgres URL on port 5432 unchanged", () => {
    assert.equal(poolerSafeUrl(DIRECT_URL), DIRECT_URL);
    const userNamedPooler = "postgresql://postgres.pooler:secret@db.internal:5432/website_builder";
    assert.equal(poolerSafeUrl(userNamedPooler), userNamedPooler);
  });

  it("adds pgbouncer=true when the host contains pooler", () => {
    const input = "postgresql://user:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
    const result = poolerSafeUrl(input);
    assert.ok(result);
    const url = new URL(result);
    assert.equal(url.port, "5432");
    assert.equal(url.password, "secret");
    assert.equal(url.searchParams.get("pgbouncer"), "true");
    assert.equal(url.searchParams.getAll("pgbouncer").length, 1);
  });

  it("does not duplicate an existing pgbouncer=true flag", () => {
    const pooler =
      "postgresql://user:p%40ss@db.example.com:6543/website_builder?schema=public&pgbouncer=true";
    const direct =
      "postgresql://user:p%40ss@postgres:5432/website_builder?sslmode=require&pgbouncer=true";
    const poolerHost =
      "postgresql://user:p%40ss@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true";
    assert.equal(poolerSafeUrl(pooler), pooler);
    assert.equal(poolerSafeUrl(direct), direct);
    assert.equal(poolerSafeUrl(poolerHost), poolerHost);
    assert.equal(new URL(pooler).searchParams.getAll("pgbouncer").length, 1);
  });

  it("does not log credentials", () => {
    const password = "credential-should-stay-unlogged";
    const pooler = `postgresql://user:${password}@db.example.com:6543/website_builder`;
    const direct = `postgresql://user:${password}@postgres:5432/website_builder`;
    const flagged = `postgresql://user:${password}@db.example.com:6543/website_builder?pgbouncer=true`;
    const calls = captureConsole(() => {
      const rewritten = poolerSafeUrl(pooler);
      assert.equal(poolerSafeUrl(direct), direct);
      assert.equal(poolerSafeUrl(flagged), flagged);
      assert.equal(poolerSafeUrl("not a url"), "not a url");
      assert.ok(rewritten?.includes(password));
      assert.equal(new URL(rewritten ?? "").searchParams.get("pgbouncer"), "true");
    });
    assert.equal(
      calls.some((line) => line.includes(password)),
      false
    );
  });
});

describe("stale prepared statements", () => {
  it("treats SQLSTATE 26000 and a missing prepared statement as retryable", () => {
    assert.equal(
      isStalePreparedStatement(new Error('prepared statement "s20" does not exist')),
      true
    );
    assert.equal(isStalePreparedStatement(new Error("SQLSTATE 26000")), true);
    assert.equal(
      isStalePreparedStatement(
        new Error(
          'PostgresError { code: "26000", message: "prepared statement \\"s20\\" does not exist" }'
        )
      ),
      true
    );
    const wrapped = new Error("Failed to get session", {
      cause: new Error('prepared statement "s20" does not exist'),
    });
    assert.equal(isStalePreparedStatement(wrapped), true);
    assert.equal(isStalePreparedStatement({ code: "26000" }), true);
  });

  it("does not treat other query failures as a missing prepared statement", () => {
    assert.equal(isStalePreparedStatement(new Error('relation "User" does not exist')), false);
    assert.equal(
      isStalePreparedStatement(new Error("Unique constraint failed on the fields: (`email`)")),
      false
    );
    assert.equal(isStalePreparedStatement(new Error("prepared statement")), false);
    const distant = `prepared statement cache disabled. ${"x".repeat(120)} relation "User" does not exist`;
    assert.equal(isStalePreparedStatement(new Error(distant)), false);
    assert.equal(isStalePreparedStatement({ code: "P2002" }), false);
    assert.equal(isStalePreparedStatement(new Error("Failed to get session")), false);
  });
});

function captureConsole(run: () => void): string[] {
  const calls: string[] = [];
  const previous = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
  const record = (...args: unknown[]) => {
    calls.push(args.map((arg) => String(arg)).join(" "));
  };
  console.log = record;
  console.info = record;
  console.warn = record;
  console.error = record;
  console.debug = record;
  try {
    run();
  } finally {
    console.log = previous.log;
    console.info = previous.info;
    console.warn = previous.warn;
    console.error = previous.error;
    console.debug = previous.debug;
  }
  return calls;
}
