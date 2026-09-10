# @bynovl/optimize-meta
Meta tag validation submodule for NOVL Optimize. Checks HTML files for the presence, uniqueness, and completeness of essential meta tags to ensure SEO and best practices for static sites.

## Quick Start

For new projects or testing out optimize, the fastest way to get started is use the Optimize installer script. Whether you're a Developer or not the script will ensure your environment is ready, install Optimize, and add the neccessary starter files and skills to help you get started.  

Open **Terminal** or **Powershell** on your computer and `cd [folder/name]` you want to setup project. Then copy/paste the following based on your OS environment:

<details>
  <summary>
  <strong>For Unix/MacOS/WSL</strong>
  </summary>
  <br>

  Copy/paste the following into **Terminal**: 

  ```bash
  # Add &TOKEN=1  after INSTALL=2 for token-only.
  curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=meta" | bash
  ```
</details>

<details>
  <summary>
  <strong>For Windows</strong>
  </summary>
  <br>

  Copy/paste the following into **Powershell**: 

  ```bash
  # PowerShell (no-bash). Add &TOKEN=1  after INSTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=meta" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*

## Usage
### Install
```bash 
npm install @bynovl/optimize-meta
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
# Runs check for meta only
npx optimize-meta
```

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

## What It Does
- **Validates required meta tags:**  
  Ensures each HTML file includes `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<link rel="canonical">`, and `<meta name="robots">` as appropriate.
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags SEO blockers:**  
  Detects `noindex`/`nofollow` in robots meta tags.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

### Known Limitations
- **Presence and format only.** Tags are checked for existence and non-empty values—content quality (e.g., description length, keyword relevance) is not evaluated out of the box
- **No cross-page duplicate detection.** Duplicate `<title>` or canonical URL conflicts across multiple pages are not detected; only per-file duplicates are reported.
- **`hreflang` not validated.** Internationalization alternate link tags are outside the scope of this check.
- **`noindex`/`nofollow` are flagged, not contextual.** These are always reported as issues regardless of whether they are intentional (e.g., staging environments)—use `ignore` to exclude pages where these are expected.


## Configuration
All standard Optimize options are available (see the [main README](../../README.md) for the full list):

- `outDir`: directory containing the built HTML files.  
- `ignore`: glob patterns or paths to exclude from the audit.  
- `batchSize`: number of files processed in parallel (default = 50)

## Output
Returns a category object with meta issues per page. 

```js
"meta": {
  // ...top level category stats 
  "failedItems": [
    {
      "page": "index.html",
      "issues": [
        {
          "target": "<meta name=\"description\">",
          "reason": "missing description",
          "isError": true,
          "isWarning": false,
          "message": "Add a meta description for SEO"
        },
        // ...
      ]
    }
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
You can extend the Meta check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customMetaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    meta: customMetaChecks,
    // ...other categories
  }
}
```
For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power Your Own Project (API)
You can use `@bynovl/optimize-meta` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMedia from '@bynovl/optimize-meta/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkMeta(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: at contributors@bynovl.com!