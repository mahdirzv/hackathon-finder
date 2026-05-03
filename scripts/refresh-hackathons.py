#!/usr/bin/env python3
"""
Hackathon refresh agent — uses Ollama (gemma4:31b-cloud) with tool calling
to fetch from sources.json and update hackathons.json.

Env vars:
  OLLAMA_BASE_URL  default: http://localhost:11434
  OLLAMA_API_KEY   default: ollama
  OLLAMA_MODEL     default: gemma4:31b-cloud
"""

import json
import os
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_API_KEY  = os.environ.get("OLLAMA_API_KEY", "ollama")
MODEL           = os.environ.get("OLLAMA_MODEL", "gemma4:31b-cloud")
REPO_ROOT       = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY           = datetime.now(timezone.utc).strftime("%Y-%m-%d")
MAX_TURNS       = 40

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "bash",
            "description": "Run a shell command (curl, python3, cat, ls, pnpm) in the repo root. Returns stdout+stderr.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string"}
                },
                "required": ["command"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a file from the repo. Path is relative to repo root.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write content to a file in the repo. Creates parent dirs if needed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path":    {"type": "string"},
                    "content": {"type": "string"}
                },
                "required": ["path", "content"]
            }
        }
    }
]

SYSTEM_PROMPT = f"""You are the hackathon-finder agent for HackathonFinder (a Next.js app).
Today's date: {TODAY}
Working directory: {REPO_ROOT}

## Task
Refresh `src/data/hackathons.json` by fetching from all active sources in `src/data/sources.json`.

## Workflow (follow exactly in order)

### Step 1 — read current state
1. read_file src/data/hackathons.json        → collect existing IDs and URLs
2. read_file src/data/.hackathon-fetch-state.json  → lastFetch, notes

### Step 2 — primary source: Devpost (covers 90% of all hackathons)
bash: python3 scripts/devpost-fetch.py
This returns a JSON array already mapped to the schema. For each entry:
- Skip if URL already in existing URLs
- Skip if endDate < {TODAY}
- Skip if ID already exists (rename with -dp suffix if needed)
Add all new valid entries to the hackathons array.

### Step 3 — secondary source: ETHGlobal (Web3 events not always on Devpost)
bash: python3 scripts/eth_fetch.py events
Returns JSON list of slugs. Filter out slugs already in seenSourceKeys.ethglobal.
For each new slug: python3 scripts/eth_fetch.py check <slug> → must return 200.
For 200 slugs: python3 scripts/eth_fetch.py detail <slug> → get dates and title.
Skip if endDate < {TODAY}.

### Step 4 — update existing entries
For any existing entry with endDate < {TODAY}, set status = "ended".
For ongoing entries (startDate <= {TODAY} <= endDate), ensure status = "ongoing".

### Step 5 — write and validate
5. write_file src/data/hackathons.json with the updated array (valid JSON, pretty-printed)
6. Update seenSourceKeys.ethglobal with all slugs checked
7. Set lastFetch to "{TODAY}T00:00:00.000Z"
8. write_file src/data/.hackathon-fetch-state.json
9. bash "python3 -c \\"import json; json.load(open('src/data/hackathons.json'))\\"; echo OK"
10. bash "pnpm --dir {REPO_ROOT} build 2>&1 | tail -3"

### Other HTML sources
bash: curl -s -A "Mozilla/5.0" <source.url>
Extract visible text, JSON-LD structured data, or date strings.

## JSON schema for each entry
{{
  "id": "kebab-case unique ID derived from title + year",
  "title": "Exact name",
  "organiser": "Company or person",
  "description": "2-3 sentences: what to build, tracks, audience.",
  "url": "Direct event page URL (not a listing or homepage)",
  "source": "ETHGlobal | DoraHacks | MLH | Devpost | Devfolio | Unstop | Other",
  "mode": "remote | in-person | hybrid",
  "status": "upcoming | ongoing | ended",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "registrationDeadline": "YYYY-MM-DD (optional)",
  "prizePool": "$X,XXX (optional)",
  "tags": ["tag1"],
  "location": "City, Country (in-person/hybrid only)",
  "teamSize": "1-4 (optional)"
}}

## Hard rules
- NEVER add an event without a 2xx HTTP response from its specific URL
- NEVER guess slugs or URLs — only use what you extracted from a live response
- NEVER duplicate existing IDs
- Status: ongoing if startDate <= {TODAY} <= endDate, upcoming if startDate > {TODAY}

After finishing, print a summary: N added, N skipped (reason breakdown), N status updates.
"""


def call_ollama(messages: list) -> dict:
    url = f"{OLLAMA_BASE_URL}/v1/chat/completions"
    payload = json.dumps({
        "model": MODEL,
        "messages": messages,
        "tools": TOOLS,
        "tool_choice": "auto",
        "max_tokens": 4096,
        "temperature": 0.1,
    }).encode()

    req = urllib.request.Request(
        url, data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OLLAMA_API_KEY}",
        }
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read())


def execute_tool(name: str, args: dict) -> str:
    if name == "bash":
        result = subprocess.run(
            args["command"], shell=True, capture_output=True,
            text=True, cwd=REPO_ROOT, timeout=90
        )
        out = result.stdout + result.stderr
        if len(out) > 5000:
            out = out[:2500] + "\n...[truncated]...\n" + out[-2500:]
        return out or "(no output)"

    if name == "read_file":
        path = os.path.join(REPO_ROOT, args["path"])
        try:
            with open(path) as f:
                content = f.read()
            if len(content) > 8000:
                content = content[:8000] + "\n...[truncated]..."
            return content
        except FileNotFoundError:
            return f"File not found: {args['path']}"

    if name == "write_file":
        path = os.path.join(REPO_ROOT, args["path"])
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(args["content"])
        return f"OK — wrote {len(args['content'])} chars to {args['path']}"

    return f"Unknown tool: {name}"


def run():
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": f"Run the hackathon refresh. Today is {TODAY}."},
    ]

    for turn in range(1, MAX_TURNS + 1):
        print(f"\n[turn {turn}/{MAX_TURNS}]", flush=True)

        try:
            response = call_ollama(messages)
        except Exception as e:
            print(f"API error: {e}", file=sys.stderr)
            sys.exit(1)

        choice = response["choices"][0]
        msg    = choice["message"]
        finish = choice["finish_reason"]

        messages.append(msg)

        if msg.get("content"):
            print(f"  Model: {msg['content'][:200]}", flush=True)

        if finish == "stop" or not msg.get("tool_calls"):
            print("\n=== Agent finished ===")
            if msg.get("content"):
                print(msg["content"])
            return

        for tc in msg["tool_calls"]:
            fn   = tc["function"]["name"]
            args = json.loads(tc["function"]["arguments"])
            arg_preview = {k: (v[:80] + "...") if isinstance(v, str) and len(v) > 80 else v
                          for k, v in args.items()}
            print(f"  → {fn}({arg_preview})", flush=True)

            result = execute_tool(fn, args)
            print(f"    ← {result[:120]}", flush=True)

            messages.append({
                "role":         "tool",
                "tool_call_id": tc["id"],
                "content":      result,
            })

    print("Max turns reached — agent did not finish", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    run()
