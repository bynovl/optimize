import fs from 'fs/promises';
import resolvePath from '@bynovl/optimize-utils/resolve-path.js';
/**
 * Save results JSON to disk
 * @param {Object} stats - Aggregated global stats
 * @param {Array} pages - Array of page results
 * @param {string} [outputPath] - Optional custom output path
 */
export async function getJson(stats, pages, outputPath) {
    const results = {
        stats,
        pages,
        timestamp: new Date().toISOString(),
    };
    const outPath = resolvePath(outputPath || 'lib/results.json');
    await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
    return outPath;
}
