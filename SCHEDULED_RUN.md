# Twice-daily Internship Radar refresh

Run by a scheduled Claude Code task at 7 AM and 5 PM Toronto time.
It only reads job boards and updates the dashboard. It never applies,
submits forms or contacts anyone.

1. `npm ci` (no Playwright install needed; scanning uses public job-board APIs).
2. `CAREER_OPS_TRUST_PROXY_EGRESS=1 node scan.mjs --quiet` (allow up to 30 minutes).
   The proxy flag is needed in Claude cloud sessions, whose egress proxy only
   reaches allowlisted public hosts.
3. `node user-scripts/export-dashboard.mjs` → `output/dashboard-postings.json`.
4. Upload that file as an asset to the dashboard
   https://claude.ai/artifact/ND3JW4inRm8tGRopPbEuYR, then update its
   `datasets/postings` document: `source.url` (the new `/_blob/...` url),
   `source.name`, and `updated: {at: <ISO now>, by: "Scheduled scan"}`.
   Delete the previous blob afterwards.
5. Commit `data/scan-history.tsv` and `data/pipeline.md` (`git add -f`) and push.

LinkedIn is not scanned: its terms forbid scraping. Paste LinkedIn postings
into `data/pipeline.md` by hand, or use LinkedIn job alerts.
