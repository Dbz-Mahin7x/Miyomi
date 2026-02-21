/**
 * One-time script: extracts downloads & lastUpdated from apps.json
 * into app-meta.json, then removes those keys from apps.json.
 *
 * Usage:  node scripts/extract-meta.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_FILE = path.join(__dirname, '../src/data/apps.json');
const META_FILE = path.join(__dirname, '../app-meta.json');

const apps = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));

const meta = { _generatedAt: new Date().toISOString() };

let stripped = 0;
for (const app of apps) {
    const entry = {};
    if (app.downloads !== undefined) {
        entry.downloads = app.downloads;
        delete app.downloads;
        stripped++;
    }
    if (app.lastUpdated !== undefined) {
        entry.lastUpdated = app.lastUpdated;
        delete app.lastUpdated;
    }
    if (Object.keys(entry).length > 0) {
        meta[app.id] = entry;
    }
}

fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2) + '\n');
fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2) + '\n');

console.log(`✅ Extracted metadata for ${Object.keys(meta).length - 1} apps`);
console.log(`✅ Stripped downloads/lastUpdated from ${stripped} apps in apps.json`);
console.log(`✅ Wrote ${META_FILE}`);
