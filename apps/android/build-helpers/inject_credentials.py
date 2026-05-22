#!/usr/bin/env python3
"""Inject TELEGRAM_API_ID / TELEGRAM_API_HASH into upstream BuildVars.java.

Usage:
    inject_credentials.py <path-to-BuildVars.java> <api_id> <api_hash>

Exit codes:
    0 — patched OK
    2 — could not find APP_ID/APP_HASH constants; build will use placeholders
    other — argument error
"""

from __future__ import annotations

import re
import sys


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print(f"usage: {argv[0]} <BuildVars.java> <api_id> <api_hash>", file=sys.stderr)
        return 64

    path, api_id, api_hash = argv[1], argv[2], argv[3]

    with open(path, "r", encoding="utf-8") as f:
        original = f.read()

    patched = re.sub(
        r"(public\s+static\s+(?:final\s+)?int\s+APP_ID\s*=\s*)\d+",
        rf"\g<1>{api_id}",
        original,
    )
    patched = re.sub(
        r'(public\s+static\s+(?:final\s+)?String\s+APP_HASH\s*=\s*")[^"]*(")',
        rf"\g<1>{api_hash}\g<2>",
        patched,
    )

    if patched == original:
        print(
            f"::warning::Could not patch APP_ID/APP_HASH in {path} — "
            "upstream may have renamed these constants.",
            file=sys.stderr,
        )
        return 2

    with open(path, "w", encoding="utf-8") as f:
        f.write(patched)
    print(f"OK injected credentials into {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
