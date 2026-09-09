/**
 * One-off: dump a legacy SQLite database to JSON for the import scripts.
 *
 *   node scripts/export-sqlite-dump.mjs
 *   node scripts/export-sqlite-dump.mjs <db-path> <out-path>
 *
 * SQLite stored DATETIME columns as epoch milliseconds and BOOLEAN as 0/1, so
 * both are normalized here — the importer's `new Date(String(value))` would
 * read a raw epoch integer as an invalid date.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DB_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'prisma', 'dev.db');
const OUT_PATH = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(ROOT, 'tmp', 'sqlite-export.json');

const db = new DatabaseSync(DB_PATH, { readOnly: true });

const tables = db
  .prepare(
    "select name from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '_prisma%'"
  )
  .all()
  .map((r) => r.name);

const dump = {};
const summary = [];

for (const table of tables) {
  const columns = db.prepare(`pragma table_info("${table}")`).all();
  const dates = new Set(
    columns.filter((c) => /DATE|TIME/i.test(c.type)).map((c) => c.name)
  );
  const bools = new Set(
    columns.filter((c) => /BOOL/i.test(c.type)).map((c) => c.name)
  );

  const rows = db.prepare(`select * from "${table}"`).all().map((row) => {
    const out = {};
    for (const [key, value] of Object.entries(row)) {
      if (value == null) {
        out[key] = null;
      } else if (dates.has(key)) {
        const d = new Date(typeof value === 'string' ? value : Number(value));
        out[key] = Number.isNaN(d.getTime()) ? null : d.toISOString();
      } else if (bools.has(key)) {
        out[key] = Boolean(value);
      } else if (typeof value === 'bigint') {
        out[key] = Number(value);
      } else {
        out[key] = value;
      }
    }
    return out;
  });

  dump[table] = rows;
  summary.push(`${String(rows.length).padStart(6)}  ${table}`);
}

mkdirSync(path.dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(dump, null, 1), 'utf8');

console.log(summary.join('\n'));
console.log(`\nWrote ${OUT_PATH}`);
