# @bynovl/optimize-schema
Schema (structured data) validation submodule for NOVL Optimize.  
Checks HTML files for valid, complete, and best-practice JSON-LD schema blocks to ensure rich search results and SEO for static sites.

## Quick Start

For new projects or testing out optimize, the fastest way to get started is use the Optimize installer script. Whether you're a Developer or not the script will ensure your environment is ready, install Optimize, and add the neccessary starter files and skills to help you get started.  

Open **Terminal** or **Powershell** on your computer and `cd [folder/name]` you want to setup project. Then copy/paste the following based on your OS environment:

<details>
  <summary>
  <strong>For Unix/MacOS/WSL</strong>
  </summary>
  
  ```bash
  # Add &TOKEN=1  after INSTALL=2 for token-only.
  curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=schema" | bash
  ```
</details>

<details>
  <summary>
  <strong>Windows</strong>
  </summary>

  ```bash
  # PowerShell (no-bash). Add &TOKEN=1  after INSTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=schema" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*


## Usage
### Install
```bash 
npm install @bynovl/optimize-schema
```

### Configuration
By default Optimize automatically looks for a build folder by the name of `_opt`, `_site`, `_build`, `public`, `out` or `dist` and loads the default settings. To change the build directory add an `optimize.config.js` in the root of your project. 

```js
export default {
  outDir: "_custom-dir", 
}
```

*Tip: run `npx optimize --setup` to install an optimize.config.js with default settings*

### Optimize

```bash
# Single check for Schema only
npx optimize-schema
```

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

## What It Does

- **Validates required schema keys:**  
  Ensures each JSON-LD block includes required keys (e.g., `@context`, `@type`, `name`) and follows your config rules.
- **Checks for missing, empty, or invalid values:**  
  Reports missing or empty required keys, and flags invalid or non-standard values.
- **Flags nested and custom schema issues:**  
  Supports custom and nested key validation via config arrays.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.


### Known Limitations
- **JSON-LD only.** Microdata and RDFa structured data formats are not supported.
- **Config-driven, not spec-driven.** Schema correctness is validated against your `schemaDataDefault` and `schemaDataCustom` rules—not the full schema.org specification. Invalid type usage or missing recommended properties outside your config will not be reported.
- **No external schema validation.** The check does not make requests to schema.org or any validator API; it only parses and checks keys present in the HTML.
- **Nested validation requires explicit config.** Deep or conditional schema structures must be explicitly defined in `schemaDataCustom` with dot notation; they are not inferred automatically. This is intentional by design.

## Configuration

All standard Optimize options are available (see the [main README](../../README.md) for the full list):

- `outDir`: Directory containing built HTML files.
- `ignore`: Array of glob patterns or paths to exclude.
- `batchSize`: Number of files to process in parallel.

Additional settings specific to schema: 

- `schemaDataDefault`: to require keys on every schema block (e.g., `@context`, `@type`, `name`).
- `schemaDataCustom`: for context-specific or nested keys. Use dot notation for nested keys and `:required` for strict presence.

```js
export default {
  schemaDataDefault: ['@context', '@type', 'name'],
  schemaDataCustom: [
    'image', // optional: warning if missing/empty
    'offers.price:required',
    'offers.priceCurrency:required',
  ]
};
```

## Output
Returns a category object with Schema issues per page. 

```js
"schema": {
  // ...top level category stats 
  "failedItems": [
    "page": "product.html",
    "issues": [
      {
        "target": "@type",
        "type": "missing",
        "reason": "missing required key",
        "isError": true,
        "isWarning": false,
        "message": "Schema block missing @type key"
      },
      // ...
    ]
  ]
}
```

## Automate with AI SKILLS
Optimize ships with five core AI‑powered skills. Install them with:

```bash 
npx optimize --skills
```
*Note: Currently auto‑detects .github, .claude, .agents, and .opencode.*

## Make it your own
You can extend the Schema check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customSchemaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    schema: customSchemaChecks,
    // ...other categories
  }
}
```

For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power Your Own Project (API)
You can use `@bynovl/optimize-schema` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMedia from '@bynovl/optimize-schema/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkSchema(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: at contributors@bynovl.com!