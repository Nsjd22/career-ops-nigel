// Export every posting the scanner has accepted (scan-history status "added")
// to a JSON file for the Internship Radar dashboard.
// Usage: node user-scripts/export-dashboard.mjs [out.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const out = process.argv[2] ?? `${root}output/dashboard-postings.json`;

const MEDTECH_COMPANIES = /medtronic|boston scientific|siemens healthineers|university health network|stryker|baxter|philips|abbott|ge healthcare|johnson & johnson|intuitive|edwards|smith\+nephew|hologic|zimmer|synaptive|intellijoint|profound medical/i;
const MEDTECH_TITLE = /biomedical|medical|clinical|health|device|surgical|imaging|regulatory|quality/i;

const [header, ...lines] = readFileSync(`${root}data/scan-history.tsv`, 'utf8').trim().split('\n');
const cols = header.split('\t');
const rows = lines
  .map((l) => Object.fromEntries(l.split('\t').map((v, i) => [cols[i], v])))
  .filter((r) => r.status === 'added');

// Postings close quietly; drop anything first seen more than 45 days ago
// (same window as max_posting_age_days in portals.yml).
const WINDOW_DAYS = 45;
const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().slice(0, 10);

const seen = new Set();
const postings = [];
for (const r of rows) {
  if (seen.has(r.url) || r.first_seen < cutoff) continue;
  seen.add(r.url);
  const medtech = MEDTECH_COMPANIES.test(r.company) || MEDTECH_TITLE.test(r.title);
  postings.push({
    id: createHash('sha1').update(r.url).digest('hex').slice(0, 12),
    company: r.company,
    title: r.title,
    location: r.location || 'Not stated',
    focus: medtech ? 'Medtech' : 'Engineering',
    posted: r.posted_at || '',
    first_seen: r.first_seen,
    source: r.portal,
    url: r.url,
  });
}
postings.sort((a, b) => (b.first_seen + b.posted).localeCompare(a.first_seen + a.posted));
writeFileSync(out, JSON.stringify(postings, null, 2));
console.log(JSON.stringify({ out, count: postings.length }));
