// Shared across all optimize packages
// NOTE: buildDir and outDir must be defined in your own config.
// If using the test/demo package, set outDir to its site directory.
const globalConfig = {
    batchSize: 50,
    ignore: [
        "accounts/",
        "api/",
        "admin/",
        "auth/",
        "dashboard/",
        "private/",
        "secure/",
        "uploads/"
    ],
    ignoreExtensions: ["pdf", "xml"],
    report: {
        preparer: "NOVL Optimize",
        fileOutput: "",
        autoRun: false
    },
    severityWeights: {
        error: 1.0,
        warning: 0.5,
    },
    disableBanner: false
};
export default globalConfig;
