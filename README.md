# @bynovl/optimize
An open source toolkit for auditing and validating your static site. You can automate accessibility, schema, meta, and other best-practice checks. It's configurable, extensible, and compatible with all static site generators. Use it in CI/CD or during development to catch issues before you go live.

## Hey Beta Friends

Thanks for joining the beta. This private repo and package are shared for testing and feedback, and we’d love to hear how optimize works in your workflow. 

Your access is in line with our [license terms](./LICENSE), and we’re open to feedback as we explore sustainable open-source models.

To get started, review the `.npmrc` script below.

[![View setup script](https://img.shields.io/badge/View-setup%20script-brightgreen?logo=github&logoColor=white&color=%2322c55e)](https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34)

Then run this command in your project directory to configure your `.npmrc` token:

```bash
curl -fsSL https://npm.bynovl.com/token-147c00d2-1d38-4f7f-9b1c-d89e47409a34 | bash
```

Everything below contains the full documentation. Feel free to add any issues or comments in the [discussion board](https://github.com/bynovl/optimize/discussions). We also included a quick feedback discussion to help us understand what matters most to you.

## Getting Started

### Install

Install via npm or pnpm:
```bash
npm install @bynovl/optimize-core
```

### Configure

Add `optimize.config.js` in the root of your project. An `outDir` with the location of your build folder is all that's required

```javascript
// optimize.config.js
export default { 
  outDir: '_site' // minimal required
}
```

### Run Your First Audit
Check the state of your project and figure out what needs to get fixed.

```bash 
# Run all checks
npx optimize
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

### Automate 
You can use the `optimize-site` skill to help analyze and fix changes bringing AI agents to your workflow in a continuous feedback loop. Go to the [Skills](https://github.com/bynovl/skills) and install.


## Configuration
Your `optimize.config.js` gives you granular control of how checks are run. Make sure your `package.json` has a `type: "module"` and export your settings as follows:

```js
export default {
  "outDir": "./_site", // Directory containing your built static site
  // Add other settings as needed
};
```

See [optimize.config.js](./templates/optimize.config..js) for full configuration. 

### Schema Validation

You can control how schema validation works using two config arrays in your `optimize.config.js`:

- `schemaDataDefault`: Keys listed here are **required on every schema JSON block** found in your HTML. Only add keys that should always be present (e.g., `@context`, `@type`, `name`). For example, if you add `image` to `schemaDataDefault`, every schema block must have an `image` property, or an error will be reported for each block missing it.

- `schemaDataCustom`: Use this to define keys that are only required in specific contexts or nested objects. You can use dot notation for nested keys and add `:required` to enforce strict presence. If a parent object exists, all `:required` child keys must exist and have a value, or an error is reported. If a key is included without `:required`, it is treated as optional—missing or empty values will result in a warning, not an error.

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
  ]
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
Right now optimize is built to check only `<img>`. When the feature is supported you'll be able to enable/disable by adding/removing types from the `mediaTypes` array. 

```javascript
{ 
  // ... other settings
  "mediaTypes": ["img", "video", "iframe", "object"]
}
```

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

### Extend checks
You can add a custom validation to an existing check using `extendChecks`. Each key is named after the check (e.g. --meta is meta) and accepts an array of objects letting you define any number of custom validation checks. The `name, regex, required, isUrl` are required for each object. `message, reason` are optional. And if you use `customValidation` it ignores the default regex.

```javascript 
// optimize.config.js
import customOpenGraphChecks from 'extend-checks.js'

export default {
  // ... other config settings
  extendChecks: {
        meta: customMetaChecks,
        links: customLinkChecks,
        media: customMediaChecks,
        accessibility: customAccessibilityChecks,
        hierarchy: customHierarchyChecks,
        openGraph: customOpenGraphChecks,
        sources: customSourcesChecks,
        // Schema NOT included
    }
}

// extend-checks.js example: 
export const customOpenGraphChecks = [
  {
    name: '<meta property="og:title">', // required
    regex: /<meta property="og:title" content="(.*?)"/i, // required
    required: true, // required
    isUrl: false, // required
    message: 'Open Graph title is missing or invalid',
    reason: 'Ensure the og:title tag is present and valid'
    // customValidation: customValidationFunction, 
  }
];
```

See [templates/extend-checks.js](./templates/extend-checks..js) for full example. 

> Note: Schema has its own check validation customization and is not recognized in `extendChecks`.


### API Mode 
If you're using optimize in an external project you'll want to disable CLI display logs. To do so enter API mode. You will also want to understand how to use Optimize programmatically. See "External Tools" section.

```javascript
{ 
  // ... other settings
  "apiMode": true // or false
}
```

## Custom Checks
Need to add more functionality beyond Optimize's 8 primary checks and extend checks isn't enough you can build your own custom check. See `templates/custom-check` folder for required files and how to work it into the Optimize flow.

## CI/CD Workflows
You can add optimize to any CI/CD workflow. We've made it easy for you to do so by adding an [optimize.yml.draft](./optimize.yml.draft) in the root of the repo. If any module fails, your workflow will return as failed, helping you catch issues before you go live.

## External Tools
Use optimize programmatically and plug into any project by using the API. You will need to rebuild the checks for your project. The following outlines the minimum required to get started. *You can also use any `optimize-lib` or `optimize-utils` to aid your development.*

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

## Power your own project

You can use `@bynovl/optimize` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.
