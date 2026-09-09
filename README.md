# Optimize <img src="https://img.shields.io/badge/beta-4ade80" alt="Beta">
An open source toolkit for auditing and validating your static site. You can automate accessibility, schema, meta, and other best-practice checks. It's configurable, extensible, and compatible with all static site generators. Use it in CI/CD or during development to catch issues before you go live.

## Hey Everyone
Thanks for joining the beta. While the project may be a little further along then a normal beta. Our goal is to build community-first. This private repo and package are shared for testing and feedback, and we’d love to hear how optimize works in your workflow. 

Your access is in line with our [license terms](./LICENSE). Please review them for permitted uses and restrictions before sharing or adapting the code. While during the beta sharing is restricted to those within the beta group, we encourage you to invite more people to join us. That said we’re open to feedback as we explore sustainable open-source models. Let's help open source survive!

**Non-coders**. 

Never set up a dev environment? Not comfortable doing so? No worries we'll help you get started. Our goal is to make Optimize accessible to both non-tech and tech people. To make it easier for you to start we'll walk you through setting up your environment and analyzing any website with Optimize. [Sign up for a demo](https://cal.com/bysyd/optimize-demo). 

**Coders**

Get started using a single script for your OS. No need to clone the repo or configure anything manually. This script will:

- Detect and install Node.js automatically (Chocolatey on Windows, nvm on Unix/WSL) if it isn’t already present
- Write `.npmrc` with the supplied token (or a placeholder when no token is needed)
- Download the `optimize-site` skill
- Create a `package.json` with `"type":"module"` if missing
- Detect your package manager and install the **requested** Optimize package


For Linux/Mac-Os/WSL
```bash
curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1" | bash
```

Windows
```bash
# PowerShell (no-bash)
Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
```

After you setup, you’re ready to run:

```bash
npx optimize
# make sure it's got a build folder to check
```

Everything below contains the full documentation. Have thoughts? feedback? Found an issue? Or just want to say hello? Join the [discussion](https://github.com/bynovl/optimize/discussions/categories/beta). Once you've had a chance to test Optimize out, help us understand what matters most—[your feedback](https://github.com/bynovl/optimize/discussions/8) is appreciated!

----

## Getting Started

### 1. Install
```bash
npm install @bynovl/optimize-core
```

### 2. Configure
By default optimize looks for a build folder by the name of `_opt`, `_site`, `_build`, `public`, `out` or `dist` and loads the default settings. To change the build directory add an `optimize.config.js` in the root of your project. Then update the `outDir` with the location of your build folder:

```javascript
// optimize.config.js
export default { 
  outDir: '_site' // minimal required
}
```

To grab a starter config, templates, skills, or CI/CD workflows, run the installer and pick only what you need:

```bash
curl -fsSL https://optimize.bynovl.com/1c98b4b4 | bash
```

### 3. Run Your First Audit
Check the state of your project and figure out what needs to get fixed.

```bash 
# Run all checks and see results in console
npx optimize
# Run all checks and get a markdown technical audit report 
npx optimize --report
```

### Fix
Once you know the areas that have the most problems you can run specific checks or dive into checks of a specific file or folder

```bash
# Run meta and accessibility checks only
npx optimize --meta --accessibility
# Run meta only on a single file
npx optimize --meta --path /path/name-to-file.html
# Run all checks on folder
npx optimize  --path /path/folder-name
```

**Flag Checks**
- `--meta`: Check for required and recommended meta tags only.
- `--open-graph`: Validate Open Graph tags for social sharing only.
- `--schema`: Validate structured data (JSON-LD schema blocks) only.
- `--accessibility`: Run accessibility checks (a11y best practices) only.
- `--hierarchy`: Check HTML heading and content hierarchy only.
- `--media`: Validate images and media assets only.
- `--sources`: Check for valid source asset references only.
- `--links`: Validate internal and external links only.

**Other Flags**
- `--path`: combine with a check flag to analyze a folder or file.
- `--json`: export results as JSON 
- `--help`: list of flags
- `--version`: current package version

## Configuration
Your `optimize.config.js` gives you granular control of how checks are run. Make sure your `package.json` has a `type: "module"`.

See [optimize.config.js](./templates/optimize.config.js) for full configuration. 

### Schema Validation
You can control how schema validation works using two config arrays in your `optimize.config.js`:

- `schemaDataDefault`: Keys listed here are **required on every schema JSON block** found in your HTML. Only add keys that should always be present (e.g., `@context`, `@type`, `name`). For example, if you add `image` to `schemaDataDefault`, every schema block must have an `image` property, or an error will be reported for each block missing it.

- `schemaDataCustom`: Use this to define keys that are only required in specific contexts or nested objects. You can use dot notation for nested keys and add `:required` to enforce strict presence. If a parent object exists, all `:required` child keys must exist and have a value, or an error is reported. If a key is included without `:required`, it is treated as optional—missing or empty values will result in a warning, not an error.

- `schemaDataExceptions`:  

**Example:**
```javascript
{
  // ... other settings
  "schemaDataDefault": ["@context", "@type", "name"],
  "schemaDataCustom": [
    "image", // optional: warning if missing/empty
    "step.name:required", // required: error if missing/empty when step exists
    "step.description:required",
    "step.performTime:required",
    "step.cost:required",
    "step.cost.@type:required",
    "step.cost.currency:required",
  ], 
  "schemaDataException":[],
};
```

> *Tip: This approach lets you enforce structured data requirements without writing custom scripts—just update your config!*

### Batch Size for Large Sites

For large sites, set `batchSize` in your config to control how many files are processed at once to improve performance and memory usage. By default it is set to 50:

```javascript
{
  // ... other settings
  "batchSize": 100, // at your own risk 
};
```

### Ignore files and directories 
You may not want to validate an entire site. To speed up processing time hide the files and folders you don't want to be validated. 

```javascript
{
  // ... other settings
  "ignore": ["sample.html", "private/", "todos/"]
}
```

### Choose Media Types 
Optimize now supports validation for all major HTML media types: `<img>`, `<video>`, `<audio>`, `<embed>`, and `<source>`. You can enable or disable checks for each type by adding or removing them from the `mediaTypes` array in your config:

```javascript
{
  // ... other settings
  mediaTypes: ["img", "video", "audio", "embed", "source", "iframe", "object"] // fully configurable
}
```

For example, to only check images and video:

```javascript
{
  // ... other settings
  mediaTypes: ["img", "video"]
}
```

Checks for each type will only run if that type is present in the array. This gives you granular control over which media elements are validated in your project.

### Get Data in different formats
Include `exportResultsJson` and/or `exportResultsCsv` with the path and file name for the location where you want your results exported in your `optimize.config.js`. Note: you can also use the `--json` flag to export results at run time.

```javascript
{
  // ... other settings
  "exportResultsJson": "/path/cool-report.json", 
  "exportResultsCsv": "even-cooler.csv"
}
```

### Define the checks you want to run
Once you've tested the checks you want to run using flags (see Common Flags for options), add them to the config as enabled checks.
```javascript
{ 
  // ... other settings
  "enabledChecks": "[--meta, --media, hierarchy]"
}
```

### API Mode 
If you're using optimize in an external project you'll want to disable CLI display logs. To do so enter API mode. You will also want to understand how to use Optimize programmatically. See "External Tools" section. (See Power Your Project).

```javascript
{ 
  // ... other settings
  "apiMode": true // or false
}
```
## Make it your own
You can extend optimize in two ways:

### Extend checks
Use `extendChecks` in your `optimize.config.js` to add custom validation to existing checks (meta, links, media, etc.). To get started, grab the `extend-checks.js` template using the [installer](#2-configure) or see the [source](./templates/extend-checks.js).

```js
import {
  customMetaChecks,
  customLinkChecks,
  customMediaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    meta: customMetaChecks,
    links: customLinkChecks,
    media: customMediaChecks,
    // ...other categories
  }
}
```
- Each array (e.g., customMetaChecks) should be defined in a separate file and imported into your config.
- See the template for structure and examples.

### Custom checks
Custom checks are for creating new, independent modules/packages that run as part of Optimize's suite. These are useful for integrating third-party tools (like pa11y, Lighthouse) or your own advanced checks. Grab the starter template using the [custom installer](https://optimize.bynovl.com/1c98b4b4) or see the [README](./templates/custom-check/README.md).

- Custom checks require their own folder, structure, and registration as a dependency.
- Once linked and added as a dependency, Optimize will discover and run your custom check automatically.


## Automate with AI SKILLS
We developed a global SKILL.md to help you summarize, analyze, and fix issues with AI. You can use it in the CLI or directly in the chat window—just choose your model and go!

**How to use:**
- Grab the skill using the [custom installer](https://optimize.bynovl.com/1c98b4b4), or [view the source](https://github.com/bynovl/optimize/skills/optimize-site/SKILL.md) and downlaod
- Add it to your project skills folder `.github/skills` or `.claude/skills`
- Use it to interpret optimize results, get summaries, and generate fixes automatically

**Learn more about SKILLS**
- [Agent SKILLS](https://agentskills.io/what-are-skills)

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Grab the workflow file using the [custom installer](https://optimize.bynovl.com/1c98b4b4), or [view the source](./templates/optimize.yml) and download. If any module fails, your workflow will return as failed, helping you catch issues before you go live.


## LLM-Driven Reporting (experimental)
Optimize supports AI-powered, markdown-first reporting using Large Language Models (LLMs) such as OpenAI, Anthropic, or GitHub Models. This feature lets you generate professional, stakeholder-ready audit reports with actionable recommendations, summaries, and visual hierarchy—all in clean markdown for easy version control. You can convert your Markdown report to HTML and spin up a local server with your own styles. And even use your own skill and prompt to help guide AI to deliver the best results every time.

**Example config:**
```js
llm: {
  provider: 'github', // or 'openai', 'anthropic', etc.
  model: 'gpt-4.1',
  key: process.env.MODEL_KEY,
},
report: {
  fileOutput: 'audit.md',
  autoRun: true,
  preparer: 'Your Name or Team',
  skill: 'seo-expert.md',
  prompt: 'seo-audit.md'
}
```

**To use:**
- Set your API key in the environment (e.g., `MODEL_KEY`), `model` and `provider`.
- Run Optimize with the `--report` flag or set `autoRun: true` in your config.
- Find your generated markdown report in the specified output file.

**Custom Skills & Prompts:**
- You can provide your own expert skill and prompt templates for custom audits (e.g., accessibility, README quality, security).

**Known Limitations**
**Known Limitations**
- Large sites can hit the LLM context window limit unless batch processing is used.
- Even with batch processing, LLM API rate limits (e.g., "Too many requests" errors) can prevent large audits from completing. This is a hard limitation of cloud LLM APIs.
- There is no perfect solution for large-scale, automated reporting with cloud LLMs—context window and rate limits are both blockers.
- The only true workaround is to use a locally hosted/self-hosted model that does not have API rate limits or token restrictions.


## Power your own project
You can use `@bynovl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

You will need to rebuild the checks for your project. The following outlines the minimum required to get started. *You can also use any `optimize-lib` or `optimize-utils` to aid your development.*

Import and run a single check:

```js
// Intended for local checks only
import { checkFns } from '@bynovl/optimize/optimize-core/api.js';
await checkFns.checkMeta(config, htmlFiles, startUrl);
```

Import and run all checks:
```js
// Full featured API can be used internally or externally with startUrl support
import { runAllChecks } from '@bynovl/optimize/optimize-core/api.js';
await runAllChecks(config, htmlFiles, startUrl);
```

So that the right settings are loaded you will also need to import the `getConfig`. Then you're ready to use optimize in your project. 
```js
// In your main script you will also need 
import getConfig from "@bynovl/optimize-lib/set-config.js" // config
const htmlFiles = ['_site/index.html', '_site/about.html']; // paths to html files
const results = await runAllChecks(config, htmlFiles);
```

> Note: if you want to run multiple checks it's best to use `runAllChecks` and update `enabledChecks` unless you have a specific use case for individual checks.


## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. We actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

Say hello at contributors@bynovl.com!
