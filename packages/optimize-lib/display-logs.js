import { clearSpinnerLine } from '@bynovl/optimize-utils/spinner.js';
import { colors } from '@bynovl/optimize-utils/ansi-colors.js';
import { getCheckModules } from './get-check-modules.js';

// Dynamically load label and key mappings from check modules to use in displayLogs
let stepKeyMap = null;
async function getStepKeyMap() {
    if (stepKeyMap) return stepKeyMap;
    const { checkModules } = await getCheckModules();
    // Use Map to preserve order, then convert to object
    const orderedMap = new Map();
    for (const mod of checkModules) {
        if (mod.label && mod.key) {
            orderedMap.set(mod.label, mod.key);
        }
    }
    stepKeyMap = Object.fromEntries(orderedMap);
    return stepKeyMap;
}

export async function displayLogs(input) {
    const result = typeof input === 'function' ? await input() : input;
    if (result && result.log) {
        try {
            const stepName = result.name || result.type || 'Check';
            if (!result.success) {
                clearSpinnerLine();
                // Header with one ❌ and check type
                console.log(colors.bgRedWhiteBold(`❌ CHECK: ${stepName}  `));
                // Found... line
                console.log(colors.white(result.log));
                // Print type-specific stats for this check type on one line, separated by |
                if (result.globalStats && Object.keys(result.globalStats).length > 0) {
                    const statsLine = Object.entries(result.globalStats)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(' | ');
                    if (statsLine.length > 0) {
                        console.log(colors.magenta(`${statsLine}`));
                    }
                }
                // Print errors for each page
                const failedItems = Array.isArray(result.failedItems)
                    ? result.failedItems
                    : [];

                const keyMap = await getStepKeyMap();

                failedItems.forEach((item) => {
                    // Print the file/page name as PATH: ...
                    console.log(colors.cyan(`PATH: ${item.page || item.path}`));
                    // Use mapped key or fallback to lowercased stepName
                    const key = keyMap[stepName] || stepName.toLowerCase();
                    if (
                        Array.isArray(item[key]?.results) &&
                        item[key].results.length > 0
                    ) {
                        item[key].results.forEach((issue) => {
                            let colorCode = colors.white;
                            if (issue.isError) {
                                colorCode = colors.red;
                            } else if (issue.isWarning) {
                                colorCode = colors.yellow;
                            }
                            let details = colors.cyan(`Target: ${issue.target || ''}`);
                            if (issue.reason) details += `\n    ${colorCode(`Reason: ${issue.reason}`)}`;
                            if (issue.message) details += `\n    ${colorCode(`Message: ${issue.message}`)}`;
                            if ('block' in issue && issue.block !== undefined)
                                details += `\n    ${colorCode(`Block: ${issue.block}`)}`;
                            if (
                                'parentBlock' in issue &&
                                issue.parentBlock !== undefined &&
                                issue.parentBlock !== null
                            )
                                details += `\n    ${colorCode(`ParentBlock: ${issue.parentBlock}`)}`;
                            // Indent error/warning under file, each field on a new line
                            console.log('- ' + details + '\n');
                        });
                    }
                });
                console.log(colors.boldGray(`===========================================\n`));
            }
        } catch (err) {
            console.error(err);
        }
    }
}
