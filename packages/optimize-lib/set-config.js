// Shared across all optimize packages
// NOTE: buildDir and outDir must be defined in your own config.
// If using the test/demo package, set outDir to its site directory.
// Test...
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
    }
};
export default globalConfig;
