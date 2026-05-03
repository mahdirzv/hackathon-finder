#!/usr/bin/env python3
"""
ETHGlobal fetch helper — avoids shell quoting issues with Chrome UA.
Usage:
  python3 scripts/eth_fetch.py events          → JSON list of slugs
  python3 scripts/eth_fetch.py check <slug>    → HTTP status code
  python3 scripts/eth_fetch.py detail <slug>   → page title + date string
"""

import json
import re
import sys
import urllib.request

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, str(e)


def cmd_events():
    status, html = fetch("https://ethglobal.com/events")
    if status != 200:
        print(json.dumps([]))
        return
    slugs = list(dict.fromkeys(re.findall(r'href="/events/([a-z0-9-]+)"', html)))
    print(json.dumps(slugs))


def cmd_check(slug: str):
    status, _ = fetch(f"https://ethglobal.com/events/{slug}")
    print(status)


def cmd_detail(slug: str):
    status, html = fetch(f"https://ethglobal.com/events/{slug}")
    if status != 200:
        print(json.dumps({"error": f"HTTP {status}"}))
        return

    title_m = re.search(r"<title>([^<]+)</title>", html)
    title = title_m.group(1).strip() if title_m else slug

    # Dates: "April 3  – 5, 2026" or "May 20 – 22, 2026"
    date_m = re.search(
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* "
        r"\d{1,2}\s*[–-]\s*\d{1,2},\s*20\d{2})",
        html
    )
    date_str = date_m.group(1).strip() if date_m else ""

    # Location
    loc_m = re.search(r'(?:in|at)\s+([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)', html)
    location = loc_m.group(1).strip() if loc_m else ""

    # Prize pool
    prize_m = re.search(r'\$[\d,]+(?:K|M)?', html)
    prize = prize_m.group(0) if prize_m else ""

    print(json.dumps({
        "title": title,
        "dateString": date_str,
        "location": location,
        "prize": prize,
        "url": f"https://ethglobal.com/events/{slug}",
    }))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "events":
        cmd_events()
    elif cmd == "check" and len(sys.argv) == 3:
        cmd_check(sys.argv[2])
    elif cmd == "detail" and len(sys.argv) == 3:
        cmd_detail(sys.argv[2])
    else:
        print(__doc__)
        sys.exit(1)
