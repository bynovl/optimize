// Shared across all optimize packages
// NOTE: buildDir and outDir must be defined in your own config.
// If using the test/demo package, set outDir to its site directory.
const globalConfig = {
    batchSize: 50,
    ignore: [
        'accounts/',
        'api/',
        'admin/',
        'auth/',
        'dashboard/',
        'private/',
        'secure/',
        'uploads/'
    ],
    ignoreExtensions: ["pdf", "xml"],
    report: {
        preparer: 'Optimize',
        fileOutput: 'audit.md',
        autoRun: false
    },
    crawl: {
        provider: '', // currently only supports 'cloudflare' 
        apiToken: '', // required: API token for the crawl provider
        accountId: '', // required: Account ID for the crawl provider
        // options: { // optional: provider-specific crawl options (e.g., for Cloudflare, you could specify crawl limits, depth, etc.)
        //   limit: 15, // Max number of pages to crawl
        //   depth: 3   // Max link depth to crawl
        //   // Add other provider-specific options here
        // }
    },
    severityWeights: {
        error: 1.0,
        warning: 0.5,
    }
};
export default globalConfig;
