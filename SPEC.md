# Mission Control v2 — from static board to live control plane

## Where we are (v1)

A single static `index.html`, snapshot from Nov 9, 2026. Sections: open threads,
needs-your-call, accounts & bills, 30-day spending, week ahead, job alerts & money
mail. Two problems: it goes stale on arrival (the "DeepSeek API key needed" item was
already resolved the night it was published), and all content is baked into markup,
so every update means editing HTML.

## Vision

A control plane, not a dashboard: one page that answers five operator questions at
a glance — what's running, what's stuck, what needs my decision, what did it cost,
what happened. That shape comes from how agent control-plane UIs are actually built
(see References). The board covers Tommy's real threads: DeepSeek harness, flip hunt,
biomarker job hunt, money admin, lab distillation kit, rewards cards.

## References — what to steal

- **Paperclip** (paperclipai/paperclip, open source): agents organized as a company —
  org chart, goal-aligned tickets, per-agent monthly budgets with auto-stop, heartbeats
  (scheduled checks), governance with an immutable audit log and approvals.
  Steal: budgets, audit log, heartbeat checks.
- **Hermes Workspace / Swarm**: multi-agent control plane with a Kanban board
  (backlog / ready / running / review / blocked / done), live session view, cost
  ledger, attention card, per-agent usage meter. Steal: Kanban lanes, attention
  card, cost ledger.
- **AgentGUI** (ETH Zürich, open source): activity feed, wall-clock overview,
  token/API telemetry, terminal output, runs grouped and steerable. Their study
  found structured views answered trace questions 38% faster than a plain
  dashboard. Steal: the activity feed and the telemetry strip.
- **Hive**: 7-column kanban where every task card shows cost, elapsed time, and
  the latest log line, plus agent slot indicators and a live terminal per task.
  Steal: card density — cost + time + latest log on each card.
- **Claude-Code-Agent-Monitor**: health score, alerts for stuck agents and token
  thresholds, per-model cost breakdown. Steal: the stuck-agent alert.

## Iteration 1 (this issue) — data-driven board + activity feed

- Split content out of markup: `data/threads.json`, `data/attention.json`,
  `data/activity.json`. `index.html` renders them with vanilla JS. No build step,
  no framework — plain static hosting.
- Sections:
  - **Health strip**: DSH harness status (the worker can read the orchestrator
    state at `http://127.0.0.1:3082/orchestrator/api/state` with header
    `x-orchestrator-request: 1` at build time and bake the snapshot into the data
    files), current model (DeepSeek V4.1 Flash on OpenCode Go), free-model quota
    state.
  - **Open threads** as cards with a status pill, next action, and owner.
  - **Attention queue** (needs-your-call) sorted by deadline. Real dated items
    to carry over: Prime Visa $100 offer ends Nov 20, 2026; Costco membership
    renewal by Dec 30, 2026; $25 Uber Cash expires Nov 15; Friday biomarker
    shortlist Nov 13, 9:40am.
  - **Activity feed**: latest events, newest first, with timestamps.
  - Keep **Accounts & bills**, **30-day spending**, **Week ahead** from v1 as
    data-driven sections.
- Correct the stale v1 facts: the DeepSeek key is DONE (Go key wired Nov 10,
  default model DeepSeek V4.1 Flash). The Facebook login item is still open.
  BioMarin Sr. Scientist I ($130–179K) is still awaiting a call.
- `README.md`: how to update the board (edit the data files, not the HTML), how
  it deploys (Spacefast, live at https://mission-control-live.space.fast/), and
  the roadmap below.
- Acceptance: `index.html` renders fully from the data files; no hard-coded thread
  content left in markup; the page works from a plain static host; README
  documents the workflow.

## Roadmap (later iterations, one issue each)

- **v2.2 — Live harness panel**: DSH ticket queue (open / running / done via
  `gh issue list` plus the orchestrator API), worker count, last PR, watchdog
  last-restart; plus a `scripts/refresh-data.sh` that regenerates the data files
  from `gh`, the orchestrator API, and the watchdog log.
- **v2.3 — Cost ledger**: Go usage per ticket/day from DSH session logs where
  available, free-model quota state, and a budget alert when the Go allowance
  runs low.
- **v2.4 — Attention automation**: the attention queue gains rules (deadline
  within 7 days = warn, within 48h = urgent) and the refresh script re-sorts it.
- **v2.5 — Kanban lanes for DSH work** (backlog / ready / running / review /
  done) mirroring the sandbox issues.

## Constraints (hard)

- Static site only: one page plus data files, no server, no build step, no
  secrets or API keys anywhere in the repo. Never paste keys into issues, code,
  or data files.
- Every change via pull request; Tommy merges. Do not auto-merge, do not push
  to main.
- Do not touch anything outside this repo. Do not change the DSH harness config.
- Keep v1's existing dark/light styling language; iteration 1 restructures the
  data, it does not redesign the look.
- **Design System (Spacefast team standards):** if a team Design System is
  enabled for tommy-team, read the team agent-context first
  (`GET /v1/teams/{teamId}/agent-context`) and apply the saved standards with
  the `apply-design-system` skill, then check the build with
  `verify-design-system`. If no Design System is enabled yet, fall back to v1's
  styling tokens (dark bg #0f1115, card #171a21, text #f2f3f5, muted #9aa3af,
  line #262b36, accent #7cc4ff, good #4ade80, warn #fbbf24; system-ui type;
  14px card radius; 1100px max width) and do not invent a new look.
