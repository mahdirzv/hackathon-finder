#!/usr/bin/env python3
"""
Fetch upcoming/open hackathons from Devpost's internal API.
Devpost is the primary aggregator — ETHGlobal, MLH, and most others list here too.

Usage:
  python3 scripts/devpost-fetch.py            → prints new entries as JSON
  python3 scripts/devpost-fetch.py --all      → include all (no quality filter)
"""

import json
import re
import sys
import urllib.request
from datetime import datetime, timezone

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
}

MONTH_MAP = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
    "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
    "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12",
}

THEME_TAG_MAP = {
    "Machine Learning/AI": "AI",
    "Artificial Intelligence": "AI",
    "Open Source": "Open Source",
    "Web": "Web",
    "Mobile": "Mobile",
    "Health & Wellness": "HealthTech",
    "Education": "EdTech",
    "Social Good": "Impact",
    "Cybersecurity": "Security",
    "Blockchain/Cryptocurrency": "Web3",
    "Augmented/Virtual Reality": "AR/VR",
    "Gaming": "Gaming",
    "Developer Tools": "DevTools",
    "FinTech": "FinTech",
    "Climate": "Climate",
    "Design": "Design",
    "Data Visualization": "Data",
}


def fetch_page(page: int) -> dict:
    url = (
        f"https://devpost.com/api/hackathons"
        f"?status[]=upcoming&status[]=open"
        f"&order_by=deadline&per_page=40&page={page}"
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s).strip()


def parse_dates(date_str: str) -> tuple[str, str]:
    """Parse 'Apr 27 - May 01, 2026' → ('2026-04-27', '2026-05-01')"""
    if not date_str:
        return "", ""

    # Extract year
    year_m = re.search(r"20\d{2}", date_str)
    year = year_m.group(0) if year_m else str(datetime.now().year)

    # Split on " - " or "–"
    parts = re.split(r"\s*[–-]\s*", date_str.replace(",", ""))

    def to_iso(part: str, fallback_month: str = "") -> str:
        part = part.strip()
        # "May 01 2026" or "May 01" or "01"
        m = re.match(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\d{1,2})\s*(\d{4})?", part)
        if not m:
            return ""
        month = MONTH_MAP.get(m.group(1) or "", fallback_month)
        day   = m.group(2).zfill(2)
        yr    = m.group(3) or year
        return f"{yr}-{month}-{day}" if month else ""

    if len(parts) == 2:
        start_month_m = re.match(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)", parts[0].strip())
        start_month   = MONTH_MAP.get(start_month_m.group(1), "") if start_month_m else ""
        start = to_iso(parts[0], start_month)
        end   = to_iso(parts[1], start_month)
        return start, end
    elif len(parts) == 1:
        d = to_iso(parts[0])
        return d, d

    return "", ""


def make_id(title: str, url: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    # Append year from URL or title if present
    year_m = re.search(r"20\d{2}", url + title)
    year   = year_m.group(0) if year_m else TODAY[:4]
    if year not in slug:
        slug = f"{slug}-{year}"
    return slug[:60]


def map_hackathon(h: dict):
    title   = h.get("title", "").strip()
    url     = h.get("url", "").strip().rstrip("/") + "/"
    dates   = h.get("submission_period_dates", "")
    org     = h.get("organization_name", "").strip()
    themes  = h.get("themes", [])
    loc     = h.get("displayed_location", {})
    state   = h.get("open_state", "open")  # "open" | "upcoming"
    prize_html = h.get("prize_amount", "")
    prizes  = h.get("prizes_counts", {})
    reg_count = h.get("registrations_count", 0)
    invite_only = h.get("invite_only", False)

    if not title or not url:
        return None

    start, end = parse_dates(dates)
    if not end or end < TODAY:
        return None

    # Quality filter: skip tiny invite-only hackathons with no prizes
    has_prize = int(prizes.get("cash", 0) or 0) > 0 or int(prizes.get("other", 0) or 0) > 0
    if invite_only and not has_prize and reg_count < 50:
        return None

    # Tags from themes
    tags = list(dict.fromkeys(
        THEME_TAG_MAP.get(t.get("name", ""), t.get("name", ""))
        for t in themes
        if t.get("name")
    ))
    if not tags:
        tags = ["General"]

    # Mode + location
    loc_text = loc.get("location", "")
    mode = "remote"
    location = None
    if loc_text and loc_text.lower() not in ("online", "remote", "virtual", "worldwide", ""):
        mode = "in-person"
        location = loc_text

    # Status
    status = "ongoing" if state == "open" else "upcoming"
    if start and start > TODAY:
        status = "upcoming"

    # Prize string
    prize_str = strip_html(prize_html)
    # Clean up unicode currency symbols
    prize_str = re.sub(r"\s+", " ", prize_str).strip()

    entry: dict = {
        "id":          make_id(title, url),
        "title":       title,
        "organiser":   org or "Devpost",
        "description": f"{title} is a hackathon hosted on Devpost. Check the event page for tracks, prizes, and eligibility.",
        "url":         url,
        "source":      "Devpost",
        "mode":        mode,
        "status":      status,
        "startDate":   start,
        "endDate":     end,
        "tags":        tags,
    }

    if prize_str and prize_str != "$0":
        entry["prizePool"] = prize_str
    if location:
        entry["location"] = location

    return entry


def fetch_all(quality_filter: bool = True) -> list[dict]:
    results = []
    page = 1
    while True:
        data  = fetch_page(page)
        items = data.get("hackathons", [])
        if not items:
            break
        for h in items:
            entry = map_hackathon(h)
            if entry:
                results.append(entry)
        total = data.get("meta", {}).get("total_count", 0)
        fetched_so_far = page * 40
        print(f"  page {page}: {len(items)} fetched, {len(results)} mapped so far (total={total})", file=sys.stderr)
        if fetched_so_far >= total:
            break
        page += 1
    return results


if __name__ == "__main__":
    all_flag = "--all" in sys.argv
    print("Fetching Devpost upcoming/open hackathons...", file=sys.stderr)
    entries = fetch_all(quality_filter=not all_flag)
    print(f"\n{len(entries)} entries after filtering", file=sys.stderr)
    print(json.dumps(entries, indent=2))
