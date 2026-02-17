// Local testing config
// Install optimize-tests package and uncomment import the config to use as a base for local testing
// import testConfig from @bynovl/optimize-tests/optimize.config.js

export default {
    outDir: '_/site', // required: path to the local build folder
    // ...testConfig, // optional: extend from test config
    // batchSize: 20, // number of files to process in each batch (default 50)
    // apiMode: true, // optional: if true, skips CLI output
    // enabledChecks: ['--meta', '--open-graph'], // optional: specify which checks to run (default is all)
    // ignore: [], 
    // processingType: // processing links (default || concurrent || max )
    // processingSize: // max number of links to process per file (for concurrent/max types)
    // schemaDataDefault: []
    // schemaDataCustom: []
    // mediaTypes: [] // e.g., ['img'],
    // inlineStyles: false, // optional: analyze inline styles (default true)
    // styleBlocks: false, // optional: analyze style blocks (default true)
    // cssFiles: true, // optional: analyze css files (default true)
    // htmlFiles: true // optional: analyze html files (default true)
    // exportResultsCsv: "sample.csv",
    // exportResultsJson: "sample.json"
    // extendChecks: {
    //     meta: customMetaChecks,
    //     links: customLinkChecks,
    //     media: customMediaChecks,
    //     accessibility: customAccessibilityChecks,
    //     hierarchy: customHierarchyChecks,
    //     openGraph: customOpenGraphChecks,
    //     sources: customSourcesChecks,
    //     // Note: schemaa checks have there own implementation 
    //     // and are not included in the extendChecks object. 
    //     // Use the schemaDefault and schemaCustom properties to define custom schema checks as needed.
    // }
};

