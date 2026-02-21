import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APPS_FILE = path.join(__dirname, '../src/data/apps.json');
const OUTPUT_FILE = path.join(__dirname, '../app-meta.json');

function extractRepo(url) {
    try {
        if (!url) return null;
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('github.com')) return null;
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        return null;
    } catch {
        return null;
    }
}

async function fetchReleases(repo) {
    let page = 1;
    let allReleases = [];

    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    while (true) {
        try {
            console.log(`  Fetching releases for ${repo} (page ${page})...`);
            const res = await fetch(
                `https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`,
                { headers }
            );

            if (!res.ok) {
                console.error(`  Failed to fetch ${repo}: ${res.status} ${res.statusText}`);
                break;
            }

            const releases = await res.json();
            if (!releases || releases.length === 0) break;

            allReleases = allReleases.concat(releases);
            if (releases.length < 100) break;
            page++;
        } catch (error) {
            console.error(`  Error fetching ${repo}:`, error.message);
            break;
        }
    }
    return allReleases;
}

function calculateDownloads(releases) {
    return releases
        .filter((r) => !r.draft)
        .reduce((total, release) => {
            return (
                total +
                release.assets.reduce((sum, asset) => sum + asset.download_count, 0)
            );
        }, 0);
}

function getLatestReleaseDate(releases) {
    const nonDraft = releases.filter((r) => !r.draft && !r.prerelease);
    if (nonDraft.length === 0) return null;
    // Sort by published_at descending
    nonDraft.sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    return nonDraft[0].published_at.split('T')[0]; // YYYY-MM-DD
}

async function main() {
    try {
        const appsData = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
        const meta = {
            _generatedAt: new Date().toISOString(),
        };

        // --- Auto-strip downloads/lastUpdated from apps.json if present ---
        let appsModified = false;
        for (const app of appsData) {
            if ('downloads' in app) { delete app.downloads; appsModified = true; }
            if ('lastUpdated' in app) { delete app.lastUpdated; appsModified = true; }
        }
        if (appsModified) {
            fs.writeFileSync(APPS_FILE, JSON.stringify(appsData, null, 2) + '\n');
            console.log('🧹 Stripped downloads/lastUpdated from apps.json\n');
        }

        console.log(`Processing ${appsData.length} apps...\n`);

        for (const app of appsData) {
            const repo = extractRepo(app.githubUrl);
            if (!repo) {
                console.log(`⏭  ${app.name} — no valid GitHub URL, skipping`);
                continue;
            }

            console.log(`📦 ${app.name} (${repo})`);
            const releases = await fetchReleases(repo);

            const downloads = calculateDownloads(releases);
            const lastUpdated = getLatestReleaseDate(releases);

            const entry = {};
            if (downloads > 0) entry.downloads = downloads;
            if (lastUpdated) entry.lastUpdated = lastUpdated;

            if (Object.keys(entry).length > 0) {
                meta[app.id] = entry;
                console.log(
                    `  ✅ downloads: ${downloads || 'N/A'}, lastUpdated: ${lastUpdated || 'N/A'}\n`
                );
            } else {
                console.log(`  ⚠️  No release data found\n`);
            }
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(meta, null, 2) + '\n');
        console.log(`\n✅ Wrote ${OUTPUT_FILE}`);
        console.log(`   ${Object.keys(meta).length - 1} apps with metadata`);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
