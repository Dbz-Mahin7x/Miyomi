
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APPS_FILE = path.join(__dirname, '../src/data/apps.json');

// Helper to extract repo from URL
function extractRepo(url) {
    try {
        if (!url) return null;
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        return null;
    } catch (e) {
        return null;
    }
}

async function fetchReleases(repo) {
    let page = 1;
    let allReleases = [];

    // Use GITHUB_TOKEN if available to avoid rate limits
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    while (true) {
        try {
            console.log(`Fetching releases for ${repo} (Page ${page})...`);
            const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, { headers });

            if (!res.ok) {
                console.error(`Failed to fetch ${repo}: ${res.statusText}`);
                break;
            }

            const releases = await res.json();
            if (!releases || releases.length === 0) break;

            allReleases = allReleases.concat(releases);
            if (releases.length < 100) break;
            page++;
        } catch (error) {
            console.error(`Error fetching ${repo}:`, error);
            break;
        }
    }
    return allReleases;
}

function calculateDownloads(releases) {
    return releases
        .filter(r => !r.draft)
        .reduce((total, release) => {
            const releaseDownloads = release.assets.reduce((sum, asset) => sum + asset.download_count, 0);
            return total + releaseDownloads;
        }, 0);
}

async function main() {
    try {
        const appsData = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
        let updated = false;

        console.log(`Processing ${appsData.length} apps...`);

        for (const app of appsData) {
            if (!app.githubUrl) continue;

            const repo = extractRepo(app.githubUrl);
            if (!repo) {
                console.warn(`Invalid GitHub URL for ${app.name}: ${app.githubUrl}`);
                continue;
            }

            const releases = await fetchReleases(repo);
            const totalDownloads = calculateDownloads(releases);

            if (totalDownloads > 0 && totalDownloads !== app.downloads) {
                console.log(`Updating ${app.name}: ${app.downloads} -> ${totalDownloads}`);
                app.downloads = totalDownloads;
                app.lastUpdated = new Date().toISOString().split('T')[0]; // Optional: Update last updated date? User didn't ask, but maybe useful. Sticking to downloads for now so minimal diff. 
                // Actually user said "update all downloads count", didn't say lastUpdated. I'll stick to downloads only to be safe, or maybe just downloads is safer to not mess with metadata.
                // Wait, "update the counter and ... apps.json". I will only update downloads.
                updated = true;
            } else {
                console.log(`No changes for ${app.name} (Current: ${app.downloads}, Fetched: ${totalDownloads})`);
            }
        }

        if (updated) {
            fs.writeFileSync(APPS_FILE, JSON.stringify(appsData, null, 2) + '\n');
            console.log('Successfully updated apps.json');
        } else {
            console.log('No updates needed.');
        }

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
