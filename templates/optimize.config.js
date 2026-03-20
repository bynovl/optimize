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
    // llm: {
    //     provider: 'github', // required: llm provider (e.g., 'openai', 'azure', 'github')
    //     model: 'gpt-4.1', // required: model name or endpoint URL (e.g., 'gpt-4', 'azure-deployment-name', full URL for custom providers)
    //     url: null, // optional: override URL for custom providers (if model is not a full URL)
    //     options: { /* Add any model-specific options here */}, // optional: model-specific options (e.g., max_tokens, temperature)
    //     key: process.env.MODEL_KEY, // required: environment variable containing the API key for the LLM provider
    // }, 
    // report: {
    //     fileOutput: 'audit.md', // specify output file for the report
    //     autoRun: true, // automatically generate report after every run
    //     preparer: 'Novl Optimize', // optional string to include in the report as the preparer/author
    //     skill: 'seo-expert.md', // optional path to markdown file with expert/system prompt (default is seo-expert.md in project root)
    //     prompt: 'seo-audit.md' // optional path to markdown file with main audit prompt template (default is seo-audit.md in project root)
    // }
}

