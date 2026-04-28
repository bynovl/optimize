import testConfig, { dir as testOutDir } from './packages/optimize-tests/optimize.config.js';
export default {
  outDir: testOutDir, // override default output directory for this test package
  // outDir: '_opt', // default output directory for all optimize packages
  ...testConfig,
  // enabledChecks: ['--meta'], // specify which checks to run (default is all)
  llm: {
    provider: 'github', 
    model: 'gpt-4.1', 
    options: {
      // Add any model-specific options here
      // max_tokens: 4096
    },
    key: process.env.MODEL_KEY, 
  },
  report: {
    fileOutput: 'audit.md', // specify output file for the report (alternative to llm.fileOutput)  
    autoRun: true, // automatically generate report after checks (alternative to llm.autoRun)
    preparer: 'Novl Optimize', // optional string to include in the report as the preparer/author
    skill: 'seo-expert.md', // optional path to markdown file with expert/system prompt (default is seo-expert.md in project root)
    prompt: 'seo-audit.md' // optional path to markdown file with main audit prompt template (default is seo-audit.md in project root)
  }
}

// [PLANNED FEATURE] In the future, Optimize will support local 
// and self-hosted LLMs (e.g., Ollama, private endpoints) as a config option. 
// This will allow users to point to a local directory or endpoint for 
// LLM-powered features, bypassing cloud API limits and improving privacy and scalability.
