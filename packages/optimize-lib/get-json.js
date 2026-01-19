import fs from 'fs/promises';
import path from 'path';
import { resolvePath } from '@bynovl/optimize-utils/resolve-path.js';
/**
 * Save results JSON to disk
 * @param {Object} globalStats - Aggregated global stats
 * @param {Array} pages - Array of page results
 * @param {string} [outputPath] - Optional custom output path
 */
export default async function getJson(globalStats, pages, outputPath) {
    const results = {
        globalStats,
        pages,
        timestamp: new Date().toISOString(),
    };
    const outPath = resolvePath(outputPath || 'lib/results.json');
    await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
    return outPath;
}
