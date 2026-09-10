# Optimize <img src="https://img.shields.io/badge/beta-4ade80" alt="Beta">
An open source toolkit for auditing and validating your static site. You can automate accessibility, schema, meta, and other best-practice checks. It's configurable, extensible, and compatible with all static site generators. Use it in CI/CD or during development to catch issues before you go live.

## Hey Everyone
Thanks for joining the beta. While the project may be a little further along then a normal beta. Our goal is to build community-first. This private repo and package are shared for testing and feedback, and we’d love to hear how Optimize works in your workflow. 

Your access is in line with our [license terms](./LICENSE). Please review them for permitted uses and restrictions before sharing or adapting the code. While during the beta sharing is restricted to those within the beta group, we encourage you to invite more people to join us. That said we’re open to feedback as we explore sustainable open-source models. Let's help open source survive!

Everything below contains the full documentation. Have thoughts? feedback? Found an issue? Or just want to say hello? Join the [discussion](https://github.com/bynovl/optimize/discussions/categories/beta). Once you've had a chance to test Optimize out, help us understand what matters most. [Your feedback](https://github.com/bynovl/optimize/discussions/8) is appreciated!

## Quick Start 

Our goal is to make Optimize accessible to both non-tech and tech people. Never setup a dev environment? Already have a project you want to test Optimize? Whether you're a Developer or Non-Developer, you can get started using a script that installs only what you need based on your environment. It will:

- Detect and install Node.js automatically (Chocolatey on Windows, nvm on MacOS/Unix/WSL) if it isn’t already present.
- Write an `.npmrc` with the token you need to use Optimize. Backs up your current one if you have one installed. 
- Creates or modifies a `package.json` with `"type":"module"`
- Installs or updates `.gitignore` so you don't write and secrets to a remote Git environment (e.g. Github). 
- Detects your package manager (npm, yarn or pnpm) and installs Optimize
- And adds all the Optimize skills 

Open **Terminal** or **Powershell** on your computer and enter `cd [folder/name]` you want to setup project and copy/paste the following. You can also see what these scripts do via the [scripts/](./scripts/) folder.

<details>
  <summary>
  For Linux/MacOS/WSL
  </summary>
  
    ```bash
    # Add &TOKEN=1  after INTALL=2 for token-only.
    curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1" | bash
    ```
</details>

<details>
  <summary>
  Windows
  </summary>

  ```bash
  # PowerShell (no-bash). Add &TOKEN=1  after INTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>
<br>

*Still need help? [Sign up for a demo](https://cal.com/bysyd/optimize-demo)*

----

## Getting Started

### 1. Install
```bash
npm install @bynovl/optimize-core
```

### 2. Configure
By default Optimize looks for a build folder by the name of `_opt`, `_site`, `_build`, `public`, `out` or `dist` and loads the default settings. To change the build directory add an `optimize.config.js` in the root of your project. 

```bash 
# creates an optimize.config.js with default settings
npx optimize --setup 
```

Then update the `outDir` with the location of your build folder:

```javascript
// optimize.config.js
export default { 
  outDir: "_custom-dir"
}
```

### 3. Run Your First Audit
Check the health your website and figure out what needs to get fixed.

```bash 
# Run all checks and see results in console
npx optimize
# Run all checks and get JSON (o-results.md) 
npx optimize --json
# Run all checks and get a deterministic human-friendly report (o-audit.md)
npx optimize --report
# Run all checks and get a CSV for spreadsheet tools (o-results.csv)
npx optimize --csv
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

**Core Flag Checks**
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
- `--skills`: install Optimize SKILLS
- `--setup`: install optimize.config.js, workflow, custom check and extend check files
- `--version`: current package version

## Configuration
Optimize works out-of-the-box with **zero-config**. For granular control over Optimize add an `optimize.config.js` and customize the config for your project. To get started with the defaults run: 

```bash 
# installs an optimize.config.js in your project root
npx optimize --setup
```

Have an SEO requirements doc? With the `optimize-setup` skill you can turn any existing SEO/Visibility requirements doc into a working `optimize.config.js`. *See the section below: "Optimize SKILLS"*.

### Schema Validation
Enforce structured data with **declarative** schema validation using the `schemaDataDefault` and `schemaDataCustom` options in `optimize.config.js`.  
Optimize **uses dot‑notation** to address nested fields e.g. `step.name` refers to the `name` property inside a `step` object.

| Option | Purpose |
|--------|---------|
| `schemaDataDefault` | An array of keys that are **required in every** JSON‑‑LD schema block found on any HTML page. Add only those properties that must always exist (e.g., `@context`, `@type`, `name`). |
| `schemaDataCustom` | An array that lets you specify keys for **specific contexts** or nested objects. Append `:required` to a key to make it mandatory; otherwise the key is optional and will only generate a warning if missing or empty. If the parent object is present, all child keys marked `:required` must also be present and non‑empty, otherwise an error is reported. |


**Example:**
```javascript
// optimize.config.js
export default {
  // …other settings

  // Keys that must appear in *every* schema block
  schemaDataDefault: ["@context", "@type", "name"],

  // Context‑specific keys (optional unless suffixed with :required)
  schemaDataCustom: [
    "image",                     // optional – warning if missing/empty
    "step.name:required",        // required when a `step` object exists
    "step.description:required",
    "step.performTime:required",
    "step.cost:required",
    "step.cost.@type:required",
    "step.cost.currency:required",
  ],
};
```

> *Tip: You can enforce complex structured‑data rules without writing any custom code. Just adjust the two arrays in your config file.*

### Batch Size for Large Sites

For large sites, set `batchSize` in your config to control how many files are processed at once to improve performance and memory usage. By default it is set to 50:

```javascript
// optimize.config.js
export default {
  // ... other settings
  batchSize: 100, // at your own risk 
};
```

### Ignore files and directories 
You may not want to validate an entire site. To speed up processing time hide the files and folders you don't want to be validated. 

```javascript
// optimize.config.js
export default {
  // ... other settings
  ignore: ["sample.html", "private/", "todos/"]
}
```

### Choose Media Types 
Enable or disable checks for specific media elements

```javascript
// optimize.config.js
export default {
  // ... other settings
  mediaTypes: ["img", "video", "audio", "embed", "source", "iframe", "object"], // defaults

  // example – only check images and video
  mediaTypes: ["img","video"],
}
```

### Get Data in different formats
You can have Optimize write results automatically to a path of your choosing, or use the CLI flags for ad‑hoc exports. Include `exportResultsJson` and/or `exportResultsCsv` with the path and file name for the location where you want your results exported.

```javascript
// optimize.config.js
export default {
  // ... other settings
  exportResultsJson: "/path/cool-report.json", 
  exportResultsCsv: "even-cooler.csv"
}
```

*Note: you can also use the `--json` or `--csv` flag to export results at run time which default to o-results.json and o-results.csv* 

### Define the checks you want to run
You can pre‑define which checks are enabled. *If enabledChecks is omitted, Optimize runs all checks that you specify on the CLI (or all checks by default).*

```javascript
// optimize.config.js
export default { 
  // ... other settings
  enabledChecks: ["--meta", "--media", "--hierarchy"]
}
```
You can also just pass the flags on the command line: 

```bash 
npx optimize --meta --media --hierarchy  
```

### Choose which checks have the most impact 
Every check contributes to the overall audit score. Prioritize certain checks (e.g., accessibility, SEO, or performance) and adjust the weights in `optimize.config.js`. Accepts a weight range: 0.1 – 1.0 (the higher the number, the larger the impact on the final score). *Tip: Put the checks that matter most for your project with the highest values.*

```js
// optimize.config.js
export default {
  // …other settings

  // Relative importance of each check (0.1‑1.0)
  checkWeights: {
    accessibility: 0.9,   // a11y is critical – give it a high weight
    hierarchy:     0.7,
    links:         0.6,
    media:         0.5,
    meta:          0.9,
    openGraph:     0.4,
    schema:        0.8,
    sources:       0.1    // low‑impact
  }
};
```

### API Mode 
Run Optimize silently (no banner, no spinner, no console logs) with `apiMode` and return results only via the programmatic API (see "Power Your Own Project" below). Ideal for scripts, CI pipelines, or when you embed Optimize in another tool.

```js
// optimize.config.js
export default {
  // ...other settings
  apiMode: true   // disable interactive CLI output
};
```

### CI/CD Workflows
Add an Optimize workflow file to your project using `npx optimize --setup workflow`. You'll get an pre-configured `optimize.yml` installed in your project root. You can add also tell Optimize where you want the file using filename `npx optimize --setup workflow .github/workflows`.  

### Deterministic Reports  
Generate professional, stakeholder-ready deterministic markdown report with actionable summaries and issues with `npx optimiize --report`. Use any AI environment to polish it with recommendations and insights using the `optimize-audit` SKILL. Or fill in recommendations with your own professional insight.

```js
// optimize.config.js
export default {
  // ...other settings
  report: {
    fileOutput: 'audit.md', // File output
    autoRun: true, // Skips CLI output generates audit automatically
    preparer: 'Your Name or Team' // Default "NOVL Optimize"
  }
}
```

*You can convert the Markdown report to HTML or spin up a local server with your own styles. And keep track of changes using version control.* 


### Remote Site Crawl
Sometimes you need to audit a live website instead of a locally‑generated build (e.g., compare a production deployment with a staging build, or run SEO checks on a site that isn’t checked into your repository). Optimize can fetch a single page directly, or it can trigger a full‑site crawl using [Cloudflare](https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/). With a single command you can retrieve the page(s) and run the full Optimize pipeline:

```bash 
# Crawl a single page (no extra config needed) and run optimize
npx optimize --crawl https://example.com
```

To enable a full‑site crawl, add a `crawl` block to your `optimize.config.js`:

```js
// Full site crawl
export default {
  crawl: {
    provider: 'cloudflare',          // Only Cloudflare is supported at the moment
    apiToken: '<YOUR_API_TOKEN>',    // Cloudflare API token with “Crawl” permission
    accountId: '<YOUR_ACCOUNT_ID>',  // Your Cloudflare account ID
    options: {                       // Optional provider‑specific settings
      limit: 15,   // Maximum number of pages to crawl
      depth: 3,    // How deep to follow internal links
      // Add any additional Cloudflare crawl parameters here
    }
  }
}
```

After you add the crawl block to optimize.config.js, running `npx optimize --crawl https://example.com` will invoke Cloudflare’s Crawl API, retrieve the site’s pages, and store them locally. You can then run Optimize against that local copy as many times as you like (e.g., npx optimize or npx optimize --json) without re‑crawling the remote site each time.

## Make it your own
You can extend Optimize in two ways:

### Extend checks
Use `extendChecks` in your `optimize.config.js` to add custom validation to existing core checks (meta, links, media, etc.). To get started run `npx optimize --setup extend-check` and install an `extend-checks.js` sample file in the root of your project. There are 3-ways you can plugin to core checks from simple true/false validation to robust logic driven validation. *The file ships with comments and examples to help you get started*

```bash 
# Intall in project root 
npx optimize --setup extend-check
# Intall in chosen directory 
npx optimize --setup extend-check path/to/dir
```

Once update import it and use it in your `optimize.config.js`: 
```js
// optimize.config.js
import {
  customMetaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // ...other settings
  extendChecks: {
    meta: customMetaChecks,
    // ...other categories
  }
}
```

### Custom checks
Custom checks are for creating new, independent modules/packages that run as part of Optimize's suite. They are useful for integrating third-party tools (like pa11y, Lighthouse) or your own advanced checks. Use `npx optimize --setup custom-check` and get the starter files with sample code to create you first custom check. Optimize recoginizes custom checks prefixed with `optimize-` (e.g. optimize-security) and once you add it as a depedency. *For more information review the README.md that ships with the custom check*.  

```bash 
# Install in project root 
npx optimize --setup custom-check 
# Install in chosen directory 
npx optimize --setup custom-check path/to/add
```

## Automate with AI SKILLS
Use Optimize's **5-core skills** to help you setup, audit, anaylze, and fix issues with with AI. You can use it in the CLI or directly in the chat window—just choose your model and go! To get started run `npx optimize --skills` and they'll automatically install in your project's skills directory. *Currently auto-detects .github, .claude, .agents, and .opencode.*

**Key features**: Translate an existing SEO/Visibility requirements doc into an `optimize.config.js`, get a summary of key issues with steps to fix, and take action with or without AI and fix them. 

```bash 
# Install all skills
npx optimize --skills 
# Install spefic skills (optimize, optimize-setup, optimize-fix, optimize-audit, optimize-analyze) 
npx optimize --skills optimize-setup
```

## Power your own project (API)
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
```without

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
