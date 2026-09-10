# @bynovl/optimize-links

Links validation submodule for NOVL Optimize. Checks HTML files for valid, working, and well-structured internal and external links to ensure site integrity and best practices for static sites.

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
  curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=links" | bash
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
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=links" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*


## Usage
### Install 
```bash 
npm install @bynovl/optimize-links
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
# Runs single check for links only
npx optimize-links
```

> Note: For most use cases, you’ll want to use [@bynovl/optimize-core](../optimize-core/README.md) to run multiple checks.

## What It Does

- **Validates internal and external links:**  
  Checks for broken links, unreachable URLs, and malformed hrefs.
- **Checks for missing or empty hrefs:**  
  Reports anchor tags without hrefs or with empty values.
- **Flags redirect and protocol issues:**  
  Detects HTTP/HTTPS mismatches, excessive redirects, and non-canonical URLs.
- **Integrates with the NOVL Optimize CLI:**  
  Can be run standalone or as part of the full site check suite.

### Known Limitations
- **External link checks require network access.** Rate-limited, authenticated, or geo-restricted URLs may return false negatives. These checks will be skipped or may time out in offline or restricted CI environments.
- **No JavaScript-generated hrefs.** Links produced by client-side routing or JS frameworks are not present in static HTML and will not be checked.
- **Redirects are flagged, not resolved.** Redirect chains are reported as issues; Optimize does not follow and verify the final destination.
- **Performance vs. accuracy tradeoff.** `processingType` and `processingSize` settings affect how many links are checked concurrently—aggressive settings may trigger rate limiting on external hosts.

## Configuration

All standard Optimize options are available (see the [main README](../../README.md) for the full list):
- `outDir`: directory containing the built HTML files.  
- `ignore`: glob patterns or paths to exclude from the audit.  
- `batchSize`: number of files processed in parallel (default = 50)

Additional settings specific to links:   
- `processingType`: Link processing mode (`default`, `concurrent`, or `max`).
- `processingSize`: Batch size or max links to process per page (integer).

## Output
Returns a category object with link issues per page. 

```js
// ..other categories
"links": {
  // ...top level category stats 
  "failedItems": [
    {
      "page": "about.html",
      "issues": [
        {
          "target": "<a href=\"/broken\">",
          "reason": "broken internal link",
          "isError": true,
          "isWarning": false,
          "message": "Link to /broken not found in output directory"
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
You can extend the Links check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customLinksChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    links: customLinksChecks,
    // ...other categories
  }
}
```
For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power Your Own Project (API)
You can use `@bynovl/optimize-links` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkLinks from '@bynovl/optimize-links/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkLinks(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: contributors@bynovl.com!