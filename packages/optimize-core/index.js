import checkMeta from '@bynovl/optimize-meta/index.js';
import checkLinks from '@bynovl/optimize-links/index.js';
import checkMedia from '@bynovl/optimize-media/index.js';
import checkSchema from '@bynovl/optimize-schema/index.js';
import checkAccessibility from '@bynovl/optimize-accessibility/index.js';
import checkHierarchy from '@bynovl/optimize-hierarchy/index.js';
import checkOpenGraph from '@bynovl/optimize-open-graph/index.js';
import checkSources from '@bynovl/optimize-sources/index.js';

export {
    checkMeta,
    checkLinks,
    checkMedia,
    checkSchema,
    checkAccessibility,
    checkHierarchy,
    checkOpenGraph,
    checkSources,
};

const checkModules = [
    { flag: '--meta', fn: checkMeta },
    { flag: '--links', fn: checkLinks },
    { flag: '--media', fn: checkMedia },
    { flag: '--schema', fn: checkSchema },
    { flag: '--accessibility', fn: checkAccessibility },
    { flag: '--hierarchy', fn: checkHierarchy },
    { flag: '--open-graph', fn: checkOpenGraph },
    { flag: '--sources', fn: checkSources },
];

// Optionally, export a function to run all enabled checks
export async function runAllChecks(config, htmlFiles, startUrl) {
    let checksToRun;
    if (config.enabledChecks && Array.isArray(config.enabledChecks) && config.enabledChecks.length > 0) {
        checksToRun = config.enabledChecks
            .map(flag => checkModules.find(m => m.flag === flag))
            .filter(Boolean);
    } else {
        // fallback: run all checkModules
        checksToRun = checkModules;
    }
    return await Promise.all(
        checksToRun.map(mod => mod.fn(config, htmlFiles, startUrl))
    );
}