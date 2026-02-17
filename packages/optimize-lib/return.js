// Dynamically update type totals
export async function updatePageTotals(item, type, labels = []) {
    item[type].stats.totalIssues = item[type].results.length;
    item[type].stats.totalErrors = item[type].results.filter(
        (r) => r.isError
    ).length;
    item[type].stats.totalWarnings = item[type].results.filter(
        (r) => r.isWarning
    ).length;
    // Custom labels for specific checks (optional)
    if (labels && typeof labels === 'object') {
        Object.entries(labels).forEach(([labelName, labelValue]) => {
            item[type].stats[labelName] = item[type].results.filter((r) => {
                const label = labelValue.toLowerCase();
                const reasonMatch = r.reason && r.reason.toLowerCase().includes(label);
                const targetMatch = r.target && r.target.toLowerCase().includes(label);
                const messageMatch =
                    r.message && r.message.toLowerCase().includes(label);
                return (targetMatch || reasonMatch || messageMatch) && r.isError;
            }).length;
        });
    }
    // Copy type-specific stats to top-level for global aggregation
    Object.assign(item.stats, item[type].stats);
}
export function updateGlobalTotals(pages, globalStats) {
    // Aggregate all stats keys dynamically
    pages.forEach((page) => {
        Object.entries(page.stats).forEach(([key, value]) => {
            if (typeof value === 'number') {
                globalStats[key] = (globalStats[key] || 0) + value;
            }
        });
    });

    return globalStats;
}
export function createNewItem(path, key) {
    const item = {
        page: `${path}`,
        stats: {}, // page-level stats
    };
    item[key] = { results: [], stats: {} };
    return item;
}
export function returnResults(failedItems, checkName, stats = {}) {
    let log = '';

    if (failedItems.length) {
        log += `Found ${failedItems.length} files with issues in ${checkName} validation.\n`;
        updateGlobalTotals(failedItems, stats);
        return {
            log,
            success: false,
            failedItems: failedItems,
            name: checkName,
        };
    } else {
        return {
            log: `No issues found in ${checkName} validation.`,
            success: true,
            failedItems: [],
            name: checkName,
        };
    }
}
