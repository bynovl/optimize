import fs from 'fs';
import path from 'path';
import { crawlCloudflare } from './crawl-cloudflare.js';
import { colors } from './ansi-colors.js';
import { consoleLog } from './debug-log.js';

function sanitizeFilename(url) {
  return url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9-_\.]/g, '_');
}
async function saveHtmlPages(records, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  for (const rec of records) {
    if (!rec.url || !rec.html) continue;
    const filename = sanitizeFilename(rec.url) + '.html';
    const filePath = path.join(outputDir, filename);
    await fs.promises.writeFile(filePath, rec.html, 'utf8');
  }
}
export function isValidHttpUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getUniqueCrawlOutputDir(baseDir = process.cwd(), baseName = 'crawl_output') {
  let dir = path.join(baseDir, baseName);
  let idx = 1;
  while (fs.existsSync(dir)) {
    dir = path.join(baseDir, `${baseName}_${idx}`);
    idx++;
  }
  return dir;
}

export function updateUserConfig(startUrl, outDir) {
  try {
    const configPath = path.resolve(process.cwd(), 'optimize.config.js');
    const absOutDir = path.resolve(outDir);
    const safeOutDir = path.relative(process.cwd(), absOutDir);

    // -------------------------------------------------------------
    if (!fs.existsSync(configPath)) {
      // Build a tiny, valid ES‑module (no extra spaces, no leading newline)
      const defaultConfig = `
export default {
  startUrl: "${startUrl}",
  outDir: "${safeOutDir}"
};
      `;

      fs.writeFileSync(configPath, defaultConfig, { encoding: 'utf8' });
      return;
    }

    // Read the existing config file
    let cfg = fs.readFileSync(configPath, 'utf8');

    // Replace startUrl and outDir if present, otherwise add them
    if (typeof startUrl === 'string') {
      if (/startUrl\s*:\s*['"`][^'"`]*['"`]/.test(cfg)) {
        cfg = cfg.replace(
          /startUrl\s*:\s*['"`][^'"`]*['"`]/,
          `startUrl: '${startUrl}'`
        );
      } else {
        cfg = cfg.replace(
          /export\s+default\s*{/,
          `export default {\n  startUrl: '${startUrl}',`
        );
      }
    }

    // Replace outDir if present, otherwise add it
    if (outDir && /outDir\s*:\s*['"`][^'"`]*['"`]/.test(cfg)) {
      cfg = cfg.replace(
        /outDir\s*:\s*['"`][^'"`]*['"`]/,
        `outDir: '${safeOutDir}'`
      );
    } else if (outDir) {
      cfg = cfg.replace(
        /export\s+default\s*{/,
        `export default {\n  outDir: '${safeOutDir}',`
      );
    }

    // Write the updated config back to the file
    fs.writeFileSync(configPath, cfg, 'utf8');

  } catch (e) {
    console.warn('[novl optimize] Warning: Could not update optimize.config.js with new startUrl/outDir:', e.message);
  }
}

// Single page crawl without provider (used if no provider is configured)
export async function simpleCrawl(siteUrl, config, outputDir = 'crawl_output') {
  // Basic fetch and save logic for a single page (no provider)
  // start timer
  const startTime = Date.now();
  const res = await fetch(siteUrl);
  if (!res.ok) throw new Error(`Failed to fetch ${siteUrl}: ${res.status}`);
  const html = await res.text();
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  // Ensure outputDir exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  // Save as a single-record array for saveHtmlPages
  await saveHtmlPages([{ url: siteUrl, html }], outputDir);
  consoleLog(colors.green(`Fetched and saved single page: ${siteUrl}\n`), config);
  consoleLog(colors.green(`Crawl completed in ${duration} seconds. Saved 1 page\n`), config);
  return;
}

export async function crawlWithProvider(siteUrl, config, outputDir = 'crawl_output', configPath = './optimize.config.js') {
  let results, duration;
  if (!config || !config.crawl || !config.crawl.provider) {
    const page = await simpleCrawl(siteUrl, outputDir);
    results = page.html;
    duration = page.duration;
  }
  const provider = config.crawl.provider.toLowerCase();
  if (provider === 'cloudflare') {
    const crawlResult = await crawlCloudflare(siteUrl, config, outputDir, configPath);
    results = crawlResult.allRecords;
    duration = crawlResult.duration;
  }
  await saveHtmlPages(results, outputDir);

  consoleLog(colors.green(`Crawl completed in ${duration} seconds. Saved ${results.length} page(s)\n`), config);
  // Print SITE AUDIT header (after crawl analysis details)
  return;
}