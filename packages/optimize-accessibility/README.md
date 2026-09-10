# @bynovl/optimize-accessibility

Accessibility validation submodule for NOVL Optimize. Checks HTML files for accessibility best practices, ARIA usage, and common issues to ensure static sites are usable by everyone.

## Quick Start

For new projects or testing out optimize, the fastest way to get started is use the Optimize installer script. Whether you're a Developer or not the script will ensure your environment is ready,  install Optimize, and add the neccessary starter files and skills to help you get started.  

Open **Terminal** or **Powershell** on your computer and `cd [folder/name]` you want to setup project. Then copy/paste the following based on your OS environment:

<details>
  <summary>
  For Linux/MacOS/WSL
  </summary>
  
    ```bash
    # Add &TOKEN=1  after INTALL=2 for token-only.
    curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=accessibility" | bash
    ```
</details>

<details>
  <summary>
  Windows
  </summary>

  ```bash
  # PowerShell (no-bash). Add &TOKEN=1  after INTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=accessibility" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*

## Usage
### Install
```bash 
npm install @bynovl/optimize-accessibility
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
# Runs check for accessibility only
npx optimize-accessibility
```

> Note: For most use cases, you’ll want to use [@bynovl/optimize-core](../optimize-core/README.md) as a single CLI entry point to to run multiple checks.

## What It Does
- **Validates accessibility attributes and structure (static checks):**  
Ensures presence and basic correctness of ARIA attributes, `alt` text, and form labels by scanning built HTML for missing, empty, or malformed attributes.
- **Checks for missing, duplicate, or empty attributes:**  
Reports missing `alt` text, unlabeled form fields, empty attributes, and other common static accessibility issues.
- **Integrates with the NOVL Optimize CLI:**  
Can be run standalone or as part of the full site check suite.

### Known Limitations
- **Static analysis only.** Checks run on built HTML; dynamically injected content (client-side rendering, JS frameworks) is not visible and will not be evaluated.
- **Presence and format, not semantic correctness.** ARIA attribute validation confirms that attributes exist and are non-empty—it does not verify that roles and properties are used semantically correctly in context.
- **No runtime behavior.** Focus management, keyboard traps, live region announcements, and focus order cannot be detected from static HTML.
- **No color contrast checking.** Contrast ratios between text and background are not evaluated.
- **Complement with dedicated a11y tools.** For full WCAG compliance audits, pair with axe, pa11y, or Lighthouse in addition to running this check.

*Note: This module is intentionally lightweight for fast CI feedback. For deeper, runtime, or visual checks (contrast, simulated user interactions, or full WCAG coverage) run a dedicated tool such as `pa11y`, `axe`/`axe-core`, or `Lighthouse` against a running site or within a headless browser.*

## Configuration

All standard Optimize options are available (see the [main README](../../README.md) for the full list):
s
- `outDir`: directory containing the built HTML files.  
- `ignore`: glob patterns or paths to exclude from the audit.  
- `batchSize`: number of files processed in parallel (default = 50)

## Output
Returns a category object with Accessibility issues per page. 

```js
// ..other categories
"accessibility": [
  // ...top level category stats 
  "failedItems": [
    {
      "page": "index.html", 
      "issues": [
        {
          "target": "<img>",
          "type": "missing", 
          "reason": "missing alt attribute", 
          "isError": true, 
          "isWarning": false, 
          "message": ""
        }
        // ...other accessibility issues
      ]
    },
    // ...other pages
  ]
]
```

## Automate with AI SKILLS
Optimize ships with five core AI‑powered skills. Install them with:

```bash 
npx optimize --skills
```
*Note: Currently auto‑detects .github, .claude, .agents, and .opencode.*

## Make it your own
You can extend the accessibility check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customAccessibilityChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    accessibility: customAccessibilityChecks,
    // ...other categories
  }
}
```

For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power your own project (API)
You can use `@bynovl/optimize-accessibility` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](../../LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkAccessibility from '@bynovl/optimize-accessibility/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkAccessibility(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: at contributors@bynovl.com!