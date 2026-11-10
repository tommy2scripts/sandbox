# Mission Control

Tommy's one board for the open threads — DeepSeek harness, flip hunt, biomarker
job hunt, money admin, lab kit, rewards cards. Live at
https://mission-control-live.space.fast/ (Spacefast, private space in Tommy's Team).

Iteration 1 of v2 is data-driven: `index.html` is a shell and `app.js` renders the
board from JSON in `data/`. No build step, no framework, no server.

## How it works

- `index.html` — page shell. It contains no board content.
- `app.js` — fetches the data files and renders the health strip, thread cards,
  deadline-sorted attention queue, activity feed, accounts, spending, and week ahead.
- `styles.css` — the styling tokens carried over from v1.
- `data/` — the board's content as JSON. Edit data files, not HTML.
- `SPEC.md` — the v2 spec and roadmap.

## Data files

| File | Holds |
| --- | --- |
| `data/threads.json` | Open-thread cards: status pill, owner, next action, detail, and the snapshot timestamp. |
| `data/attention.json` | "Needs your call" items with a deadline; rendered earliest deadline first. |
| `data/activity.json` | Latest harness, board, job, money, and flip-hunt events. |
| `data/health.json` | Build-time snapshot of DSH harness health, current model, and free-model quota state. |
| `data/accounts.json` | Account balances and bills. |
| `data/spending.json` | Last-30-day spending categories; the total is computed at render time. |
| `data/week.json` | Week-ahead calendar events. |

Dates and times are ISO 8601 in Pacific time (`2026-11-13T09:40:00-08:00`).
Date-only values (`2026-11-20`) mean the whole day. The attention queue and
activity feed sort in `app.js`, so file order does not matter. `health.json` is a
snapshot baked in at build time, not a live probe.

## Updating the board

1. Edit the JSON in `data/`.
2. Preview locally: run `python3 -m http.server 8000` in this folder, then open
   http://localhost:8000/.
3. Publish the static files to the Spacefast space.

Do not paste secrets or API keys into this repo — ever. Do not hand-edit
`index.html` to add content; it renders from `data/`.

## Deploy

The publish root is the repo root: `index.html`, `app.js`, `styles.css`, and
`data/`. The live board is a private Spacefast space in Tommy's Team at
https://mission-control-live.space.fast/. Static hosting only — no build step,
no server, no secrets.

## Roadmap

Iterations land one issue at a time.

- **v2.2 — Live harness panel**: DSH ticket queue (open / running / done via
  `gh issue list` plus the orchestrator API), worker count, last PR, watchdog
  last-restart; plus `scripts/refresh-data.sh` to regenerate data files.
- **v2.3 — Cost ledger**: Go usage per ticket/day, free-model quota state, and a
  budget alert when the Go allowance runs low.
- **v2.4 — Attention automation**: deadline rules (within 7 days = warn, within
  48h = urgent) and automatic re-sorting by the refresh script.
- **v2.5 — Kanban lanes for DSH work** (backlog / ready / running / review /
  done) mirroring the sandbox issues.

## Built by

DeepSeek's dsh-superagent harness (profile `superagent` on this VM) works this
repo from GitHub issues: mention `@tommy2scripts` in an issue and it answers
with a pull request. Tommy merges; nothing auto-merges.
