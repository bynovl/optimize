import fs from 'fs/promises';
import path from 'path';

/**
 * Export results as JSON file.
 * @param {any} data - The data to export.
 * @param {string} outPath - The output file path.
 */
export async function exportResultsAsJson(data, outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Export results as CSV file (simple flat array of objects).
 * @param {Array<Object>} data - The data to export.
 * @param {string} outPath - The output file path.
 */

// The Results 
export async function exportResultsAsCsv(data, outPath) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Data must be a non-empty array of objects');
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    }
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, csvRows.join('\n'), 'utf8');
}
