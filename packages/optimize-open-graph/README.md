# @bynovl/optimize-open-graph
Open Graph validation submodule for NOVL Optimize. Checks HTML files for the presence, correctness, and completeness of Open Graph tags to ensure rich previews and best practices for static sites.

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
  curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=open-graph" | bash
  ```
</details>

<details>
  <summary>
  <strong>For Windows</strong>
  </summary>
  <br>

  Copy/paste the following into **Powershell**: 

  ```powershell
  # PowerShell (no-bash). Add &TOKEN=1  after INSTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=open-graph" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*

## Usage
### Install
```bash 
npm install @bynovl/optimize-open-graph
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
# Runs check for open graph only
npx optimize-open-graph
```

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

## What It Does
- **Validates required Open Graph tags:**  
  Ensures each HTML file includes `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, and other recommended tags.
- **Also validates Twitter tags:** Ensures each file include  `<meta name="twitter:card"> <meta name="twitter:title"> <meta name="twitter:description"> <meta name="twitter:image">`
- **Checks for missing, duplicate, or empty tags:**  
  Reports missing tags, duplicate tags, and tags with empty values.
- **Flags preview and sharing issues:**  
  Detects non-canonical URLs and nofollow robots text. 
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

### Known Limitations
- **Tag presence only—images are not fetched.** `og:image` URLs are validated, but the image is not downloaded or checked for correct dimensions, file size, or reachability.
- **No live social preview validation.** Results reflect static HTML content only; actual platform rendering (Facebook, LinkedIn, X/Twitter) may differ based on cache, scraper behavior, or platform-specific rules.
- **Duplicate detection is per-file only.** Cross-page `og :url` conflicts or canonical mismatches are not detected.

## Configuration
All standard Optimize options are available (see the [main README](../../README.md) for the full list):

- `outDir`: directory containing the built HTML files.  
- `ignore`: glob patterns or paths to exclude from the audit.  
- `batchSize`: number of files processed in parallel (default = 50)

## Output
Returns a category object with Open Graph issues per page. 

```js
"openGraph": {
  // ...top level category stats 
  "failedItems": [
    {
      "page": "index.html",
      "openGraph": [
        {
          "target": "<meta property=\"og:image\">",
          "reason": "missing og:image",
          "isError": true,
          "isWarning": false,
          "message": "Add an og:image for rich previews"
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
You can extend the Open Graph check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customOpenGraphChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    openGraph: customOpenGraphChecks,
    // ...other categories
  }
}
```
For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power Your Own Project (API)
You can use `@bynovl/optimize-open-graph` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMedia from '@bynovl/optimize-open-graph/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkOpenGraph(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: at contributors@bynovl.com!