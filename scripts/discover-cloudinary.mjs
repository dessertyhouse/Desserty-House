#!/usr/bin/env node
/**
 * discover-cloudinary.mjs
 * -----------------------
 * Lists every image in the Cloudinary account, matches each one to the logical
 * path the website asks for, and rewrites `src/app/cloudinary-manifest.ts`.
 *
 * Cloudinary adds a random suffix on upload (`bomboloni-9` -> `bomboloni-9_nptmpo`),
 * and that suffix cannot be guessed — this script is how you capture it.
 *
 * USAGE
 *   CLOUDINARY_CLOUD_NAME=pjn0251d \
 *   CLOUDINARY_API_KEY=xxxxxxxxxxxxxxx \
 *   CLOUDINARY_API_SECRET=yyyyyyyyyyyyyyyyyyyyyyy \
 *   node scripts/discover-cloudinary.mjs
 *
 * Options
 *   --dry     print the manifest to stdout, don't write the file
 *   --verify  after writing, HEAD every URL and report failures
 *
 * The API secret is read from the environment and is never written to disk or
 * printed. Do not paste it into any tracked file.
 */

import { writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'src/app/cloudinary-manifest.ts');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'pjn0251d';
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const DRY = process.argv.includes('--dry');
const VERIFY = process.argv.includes('--verify');

if (!KEY || !SECRET) {
  console.error(`
Missing credentials.

  CLOUDINARY_CLOUD_NAME=${CLOUD} \\
  CLOUDINARY_API_KEY=... \\
  CLOUDINARY_API_SECRET=... \\
  node scripts/discover-cloudinary.mjs

Find them at: Cloudinary Console -> Settings -> API Keys
`);
  process.exit(1);
}

/* ---------- what the website asks for -------------------------------------- */

const SLUGS = ['brownies', 'bento', 'fondant', 'bomboloni', 'cupcakes', 'donuts', 'pizza', 'birthday'];

/** Every logical path the site can request, in render order. */
function wantedPaths() {
  const out = [];
  for (const slug of SLUGS) {
    for (let i = 1; i <= 10; i++) out.push(`/collections/${slug}/${slug}-${i}.jpg`);
  }
  for (let i = 1; i <= 46; i++) {
    out.push(`/showcase/real/dh-showcase-${String(i).padStart(2, '0')}.png`);
  }
  out.push('/hero-brownie-cake.png', '/fondant-showcase.png');
  return out;
}

/** The stem Cloudinary would have derived from the original filename. */
function stemFor(path) {
  return path.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
}

/* ---------- fetch every asset ---------------------------------------------- */

const auth = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');

async function listAll() {
  const all = [];
  let cursor = null;
  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/image`);
    url.searchParams.set('max_results', '500');
    if (cursor) url.searchParams.set('next_cursor', cursor);

    const res = await fetch(url, { headers: { Authorization: auth } });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Cloudinary API ${res.status}. ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    all.push(...(json.resources || []));
    cursor = json.next_cursor || null;
    process.stderr.write(`  fetched ${all.length} assets\r`);
  } while (cursor);
  process.stderr.write('\n');
  return all;
}

/* ---------- match -------------------------------------------------------- */

function buildManifest(resources) {
  // index by the part of the public_id before Cloudinary's random suffix
  const byStem = new Map();
  for (const r of resources) {
    const id = r.public_id;
    const leaf = id.split('/').pop();
    const stem = leaf.replace(/_[a-z0-9]{6,}$/i, '');
    if (!byStem.has(stem)) byStem.set(stem, []);
    byStem.get(stem).push(id);
    if (!byStem.has(leaf)) byStem.set(leaf, []);
    if (!byStem.get(leaf).includes(id)) byStem.get(leaf).push(id);
  }

  const manifest = {};
  const missing = [];
  for (const path of wantedPaths()) {
    const stem = stemFor(path);
    const hits = byStem.get(stem);
    if (hits && hits.length) manifest[path] = hits[0];
    else missing.push(path);
  }
  return { manifest, missing };
}

/* ---------- emit --------------------------------------------------------- */

function render(manifest, missing) {
  const groups = [
    ['Product collections', (p) => p.startsWith('/collections/')],
    ['Showcase — real previous orders', (p) => p.startsWith('/showcase/')],
    ['Site imagery', (p) => !p.startsWith('/collections/') && !p.startsWith('/showcase/')],
  ];

  let body = '';
  for (const [label, test] of groups) {
    const keys = Object.keys(manifest).filter(test);
    if (!keys.length) continue;
    body += `\n  // ---- ${label} ${'-'.repeat(Math.max(0, 62 - label.length))}\n`;
    for (const k of keys) body += `  ${JSON.stringify(k)}: ${JSON.stringify(manifest[k])},\n`;
  }
  if (missing.length) {
    body += `\n  // NOT FOUND IN CLOUDINARY (${missing.length}) — upload these, then re-run\n`;
    for (const m of missing) body += `  // ${m}\n`;
  }

  return `/**
 * Cloudinary asset manifest — logical site path -> Cloudinary public_id.
 *
 * GENERATED by scripts/discover-cloudinary.mjs on ${new Date().toISOString()}
 * Do not hand-edit; re-run the script after uploading or renaming images.
 *
 * Cloudinary appends a random suffix on upload (bomboloni-9 -> bomboloni-9_nptmpo)
 * which cannot be derived from the filename, hence this lookup table. Assets use
 * dynamic folders, so delivery public_ids sit at the ROOT with no folder prefix.
 *
 * Entries: ${Object.keys(manifest).length}${missing.length ? ` | Missing: ${missing.length}` : ' | Complete'}
 */

/** logical path (as passed to \`media()\`) -> Cloudinary public_id */
export const MANIFEST: Record<string, string> = {${body}};

/** Cloudinary cloud name. Public — it appears in every image URL. */
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ${JSON.stringify(CLOUD)};

/** f_auto: best format per browser, q_auto: smart compression, dpr_auto: retina. */
export const DELIVERY_TX = 'f_auto,q_auto,dpr_auto';

/** Build a direct Cloudinary delivery URL for a known public_id. */
export function cloudinaryUrl(publicId: string, tx: string = DELIVERY_TX): string {
  return \`https://res.cloudinary.com/\${CLOUD_NAME}/image/upload/\${tx}/\${publicId}\`;
}
`;
}

/* ---------- verify ------------------------------------------------------- */

async function verify(manifest) {
  const entries = Object.entries(manifest);
  let ok = 0;
  const bad = [];
  await Promise.all(
    entries.map(async ([path, id]) => {
      const url = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/${id}`;
      try {
        const r = await fetch(url, { method: 'HEAD' });
        if (r.ok) ok++;
        else bad.push([path, id, r.status]);
      } catch {
        bad.push([path, id, 'ERR']);
      }
    })
  );
  console.log(`\nVerified: ${ok}/${entries.length} reachable`);
  for (const [p, id, s] of bad) console.log(`  FAIL ${s}  ${p} -> ${id}`);
  return bad.length === 0;
}

/* ---------- main --------------------------------------------------------- */

console.log(`Cloud: ${CLOUD}\nListing assets...`);
const resources = await listAll();
console.log(`Total assets in account: ${resources.length}`);

const { manifest, missing } = buildManifest(resources);
console.log(`Matched: ${Object.keys(manifest).length} / ${wantedPaths().length}`);
if (missing.length) {
  console.log(`\nNot found (${missing.length}):`);
  for (const m of missing.slice(0, 20)) console.log(`  ${m}`);
  if (missing.length > 20) console.log(`  ...and ${missing.length - 20} more`);
}

const source = render(manifest, missing);
if (DRY) {
  console.log('\n--- dry run, not writing ---\n');
  console.log(source);
} else {
  if (!existsSync(dirname(OUT))) throw new Error(`Missing dir: ${dirname(OUT)}`);
  writeFileSync(OUT, source, 'utf8');
  console.log(`\nWrote ${OUT}`);
}

if (VERIFY) {
  const allOk = await verify(manifest);
  process.exit(allOk ? 0 : 1);
}
