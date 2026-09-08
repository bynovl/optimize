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
/**
 * Flatten a nested category object into a flat array.
 * @param {Object|Array} data - Either an array of items or an object where each key is a category name.
 * @returns {Array} Flat array with a guaranteed `category` field on each item.
 */
export function flattenCategoryData(data) {
    // If it's already an array (flat list of results), just return it.
    if (Array.isArray(data)) return data;

    if (!data || typeof data !== 'object') return [];

    // The structure we receive has categories as keys, each containing an object
    // with a `failedItems` array. Extract those items and attach the category name.
    return Object.entries(data).flatMap(([catName, catObj]) => {
        if (!catObj || typeof catObj !== 'object') return [];
        const items = Array.isArray(catObj.failedItems) ? catObj.failedItems : [];
        // Each failedItem may already have a `category` field; preserve it if present.
        return items.map(item => ({ ...item, category: item.category ?? catName }));
    });
}

export async function exportResultsAsCsv(data, outPath) {
    const headers = ['page', 'category', 'type', 'message', 'reason', 'target', 'error', 'warning'];
    const csvRows = [headers.join(',')];

    // Determine if we have the hierarchical structure (categories -> failedItems)
    let categoriesMap;
    if (data && data.categories) {
        categoriesMap = data.categories;
    } else if (data && typeof data === 'object' && Object.values(data)[0]?.failedItems) {
        categoriesMap = data; // raw map without top‑level `categories`
    }

    if (categoriesMap) {
        // Walk category → page → issues
        for (const [catName, catObj] of Object.entries(categoriesMap)) {
            const failedItems = catObj.failedItems || [];
            for (const pageItem of failedItems) {
                const page = pageItem.page ?? '';
                const issues = pageItem.issues || [];
                for (const iss of issues) {
                    const row = {
                        page,
                        category: catName,
                        type: iss.type ?? iss.checkType ?? '',
                        message: iss.message ?? iss.reason ?? '',
                        reason: iss.reason ?? '',
                        target: iss.target ?? '',
                        error: iss.isError ? 'true' : '',
                        warning: iss.isWarning ? 'true' : ''
                    };
                    csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
                }
            }
        }
    } else {
        // Fallback: treat data as a flat array (already normalized by flattenCategoryData)
        const flatItems = flattenCategoryData(data);
        if (flatItems.length === 0) {
            throw new Error('No result items to export as CSV');
        }
        for (const item of flatItems) {
            const row = {
                page: item.page ?? item.path ?? '',
                category: item.category ?? item.check ?? '',
                type: item.type ?? item.checkType ?? '',
                message: item.message ?? item.reason ?? '',
                reason: item.reason ?? '',
                target: item.target ?? '',
                error: item.isError === true ? 'true' : '',
                warning: item.isWarning === true ? 'true' : ''
            };
            csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
        }
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, csvRows.join('\n'), 'utf8');
}
