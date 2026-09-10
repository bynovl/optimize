# @bynovl/optimize-media
Media validation submodule for NOVL Optimize. Checks HTML files for valid, accessible, and optimized use of images, video, and other media assets to ensure best practices for static sites.

## Quick Start

For new projects or testing out optimize, the fastest way to get started is use the Optimize installer script. Whether you're a Developer or not the script will ensure your environment is ready, install Optimize, and add the neccessary starter files and skills to help you get started.  

Open **Terminal** or **Powershell** on your computer and `cd [folder/name]` you want to setup project. Then copy/paste the following based on your OS environment:

<details>
  <summary>
  For Linux/MacOS/WSL
  </summary>
  
    ```bash
    # Add &TOKEN=1  after INTALL=2 for token-only.
    curl -fsSL "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=1&check=media" | bash
    ```
</details>

<details>
  <summary>
  Windows
  </summary>

  ```bash
  # PowerShell (no-bash). Add &TOKEN=1  after INTALL=2 for token-only.
  Invoke-WebRequest -Uri "https://npm.bynovl.com/token-0ba2a994-f671-48ae-9acc-30a350d37bae?INSTALL=2&check=media" -Headers @{ 'User-Agent' = 'curl/7.88.0' } | ForEach-Object { $_.Content } | powershell -NoProfile -ExecutionPolicy Bypass -Command -
  ```
</details>

**Note: You can view scripts via the [scripts/](../../scripts/) folder*

## Usage
### Install
```bash 
# Runs check for Media only
npm install @bynovl/optimize-media
```

> Note: For most use cases, use @bynovl/optimize-core to run and combine multiple checks in one command.

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
# Single check for media only 
npx optimize-media
```

> Note: For most use cases, you'll want to use [@bynovl/optimize-core](../optimize-core/README.md) to run multiple checks together or as a single CLI entry point.


## What It Does

- **Validates media tags and asset sources:** Checks `<img>` tags and validates image `src` values. Also scans inline styles and `<style>` blocks for `background` and `background-image` URLs.
- **Reports missing, empty, and invalid media asset URLs:** Flags missing image `src` attributes, broken local image paths, unreachable external image URLs, empty CSS background URLs, and invalid background asset references.
- **Integrates with the NOVL Optimize CLI:** Can be run standalone or as part of the full site check suite.

### Known Limitations

- **`<img>` only.** Only `<img>` elements are currently validated. `<video>`, `<audio>`, `<iframe>`, and `<object>` are listed in `mediaTypes` config but are not yet checked—support is planned.
- **No image optimization checks.** File size, dimensions, format (WebP, AVIF), and compression are not evaluated.
- **CSS background images may be partially missed.** Inline styles and style blocks are parsed, but complex or minified CSS patterns in external files may not be fully detected. Data URIS are skipped.

## Configuration

All standard Optimize options are available (see the [main README](../../README.md) for the full list):
- `outDir`: directory containing the built HTML files.  
- `ignore`: glob patterns or paths to exclude from the audit.  
- `batchSize`: number of files processed in parallel (default = 50)

Additional settings specific to media:   
- `mediaTypes`: Array of media tag types to check (e.g., `['img', 'video', 'audio', 'embed', 'source', 'object', 'iframe']`).
- `inlineStyles`: Check media within inline styles (default true)
- `styleBlocks`: Check media within style blocks (default true)
- `cssFiles`: Check CSS files (default true)
- `htmlFiles`: Check HTML file (default true). Note: when set to false inline styles and style blocks will not be checked


## Output
Returns a category object with Media issues per page. 

```js
// ..other categories
"media": {
  // ...top level category stats 
  "failedItems": [
    {
      "page": "gallery.html",
      "issues": [
        {
          "target": "<img src=\"large.jpg\">",
          "reason": "image URL invalid",
          "isError": false,
          "isWarning": true,
          "message": "The image doesn't exist"
        },
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
You can extend the Media check with your own rules and custom validation with `extendChecks` in your `optimize.config.js`. To get started, run `npx optimize --setup extend-check` to get started with an `extend-checks.js` template.

```js
import {
  customMediaChecks,
  // ...other categories
} from './extend-checks.js';

export default {
  // existing settings
  extendChecks: {
    media: customMediaChecks,
    // ...other categories
  }
}
```
For completely new checks, run `npx optimize --setup custom-check` and refer to the generated README. 

## CI/CD Workflows
You can add optimize to any CI/CD workflow. Quickly add the workflow file using `npx optimize --setup workflow`. An `optimize.yml` will be installed in your project root. If any module fails, your workflow will fail helping you catch issues before you go live.

## Power Your Own Project (API)
You can use `@bynovl/optimize-media` as a library to build your own tools, workflows, or integrations for non-commercial distribution. For license terms and more information, see the [LICENSE](./LICENSE) file.

```js
import { getConfig } from '@bynovl/optimize-lib/get-config.js';
import checkMedia from '@bynovl/optimize-media/index.js';

const { config, nonIgnoredHtmlFiles } = await getConfig();
const results = await checkMedia(config, nonIgnoredHtmlFiles);
console.log(results);
```

## Contributing
Times are changing and we needed something in-house that can help us work smarter not harder. This project started out as a need to solve some of our own unseen static site and static site generator (SSG) problems and figured it might help some of you too. 

We don't have time to manage pull requests at the moment. Good news, we actively use Optimize in our projects so you'll see updates regularly. At the very least we'll do our best to make updates and push changes tri-weekly.
 
For features you'd like to see or if you spot any bugs jump into the [discussion](https://github.com/bynovl/optimize/discussions).  Want to contribute? Yes please, let's build together and make websites better, faster, accessible and AI-ready without any dependencies other than the ones you choose to use. 

**Say hello**: at contributors@bynovl.com!