# Mission Control

Tommy's one board for the open threads — DeepSeek harness, flip hunt, biomarker
job hunt, money admin, lab kit, rewards cards. Live at
https://mission-control-live.space.fast/ (Spacefast, private space in Tommy's Team).

## How it works

- `index.html` — the board. Static page, no build step, no framework.
- `data/` — the board's content as JSON. Edit data files, not HTML.
- `SPEC.md` — the v2 spec: turning this static snapshot into a live control
  plane (health strip, attention queue, activity feed, cost ledger). Iterations
  land one issue at a time.

## Updating the board

Edit the JSON in `data/`, then publish. Do not paste secrets or API keys into
this repo — ever.

## Built by

DeepSeek's dsh-superagent harness (profile `superagent` on this VM) works this
repo from GitHub issues: mention `@tommy2scripts` in an issue and it answers
with a pull request. Tommy merges; nothing auto-merges.
