"""Export prisma/dev.db into tmp/sqlite-export.json for the Postgres importer."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "prisma" / "dev.db"
OUT = ROOT / "tmp" / "sqlite-export.json"

DATE_COLS = {
    "createdAt",
    "updatedAt",
    "expiresAt",
    "accessTokenExpiresAt",
    "refreshTokenExpiresAt",
}
BOOL_COLS = {"emailVerified", "isAdmin", "published", "estimated", "generationDegraded"}
TABLES = [
    "user",
    "session",
    "account",
    "verification",
    "Template",
    "Project",
    "Questionnaire",
    "Quote",
    "Payment",
    "Deployment",
    "CreditWallet",
    "CreditLedger",
    "AiUsage",
]


def to_iso(value):
    if value is None or value == "":
        return None
    if isinstance(value, str) and "T" in value:
        return value
    try:
        ms = int(value)
    except (TypeError, ValueError):
        return str(value)
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()


def to_bool(value):
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    return bool(int(value))


def main() -> None:
    if not DB.exists():
        raise SystemExit(f"SQLite file not found: {DB}")

    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    existing = {
        r[0]
        for r in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
    }

    payload = {}
    for table in TABLES:
        if table not in existing:
            payload[table] = []
            continue
        cols = [c[1] for c in cur.execute(f"PRAGMA table_info([{table}])")]
        rows = []
        for raw in cur.execute(f"SELECT * FROM [{table}]"):
            row = {}
            for col in cols:
                value = raw[col]
                if col in DATE_COLS:
                    value = to_iso(value)
                elif col in BOOL_COLS:
                    value = to_bool(value)
                row[col] = value
            rows.append(row)
        payload[table] = rows

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload), encoding="utf-8")
    print("Wrote", OUT)
    for table, rows in payload.items():
        print(f"  {table}: {len(rows)}")


if __name__ == "__main__":
    main()
