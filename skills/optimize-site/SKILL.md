---
name: novl-optimize
description: Post-build validation tool for static sites. Use when asked to "check SEO", "validate site", "run optimize", "check accessibility", "check meta", "check schema", "check links", "check media", "check hierarchy", "check schema" or "check open graph". Run after building to catch issues before deployment.
license: Custom source-available (see LICENSE in package repository)
metadata:
  author: NOVL
  repository: https://github.com/bynovl/optimize
  version: "1.0"
---

# Optimize - Static Site Validation

Post-build CLI tool for static site validation. Analyzes your built HTML for hierarchy, accessibility, meta, schema, open graph, links, sources and media issues. Works with any static site generator. Ideal for pre-deployment checks and CI/CD.

## Quick Start

1. Install `@bynovl/optimize` package as a dev dependency in your project:

```bash
npm install -D @bynovl/optimize
```

2. Configure `optimize.config.js` with your build output directory and any ignore patterns:

```js
export default {
  outDir: 'dist', // Replace with your build output directory (required)
  ignore: [ // Optional: patterns to ignore specific files/directories
    '404.html',          // Ignore 404 page
    'drafts/**/*.html',  // Ignore all HTML files in drafts/
    'private/**',        // Ignore entire private/ directory
    '**/test-*.html',    // Ignore any HTML file starting with test-
  ],
};
```
> Note: make sure that your package.json has modules enabled (e.g. `"type": "module"`) to use the ES module syntax in `optimize.config.js`.

3. Build your site using the static site generator's `build` or `serve` command to generate the HTML files in the output directory.

```bash
# 11ty, hugo, jekyll,etc.
eleventy build
# or
hugo
# or
jekyll build
# or if you have a build script set up
npm run build 
```

4. Run `npx optimize` to analyze the built HTML and get a report of all issues found organized by category and priority. Use the report to systematically fix issues in your template files.

```bash
npx optimize
```

## Before You Start: Read optimize.config.js

**Always read `optimize.config.js` before running optimize or making any fixes.** This file is the source of truth for project structure and must be resolved before touching any files.

### Step 1: Read the config
```bash
cat optimize.config.js
```

### Step 2: Extract and resolve these key settings

| Setting | What it means | What to do |
|---------|--------------|------------|
| `outDir` | Where built HTML files live — **used for analysis only, do not edit these files directly** | Resolve the absolute path (see below) |
| `enabledChecks` | If set, only these checks are active | Don't analyse or report on disabled checks |
| `schemaDataCustom` | Additional required schema fields beyond defaults | Include these when validating schema issues |
| `apiMode` | Changes output format | Adjust how you parse results |
| `ignore` | Files/dirs excluded from checks | Don't flag issues in ignored paths |

Note: If any of these settings are imported from another package/file, read that package's config file to resolve the real values.

### Step 3: Resolve outDir to an absolute path

`outDir` may be a simple string (`'dist'`) or imported from a package:

```js
// Simple — outDir is relative to project root
export default { outDir: 'dist' }
// → /your/project/dist

// Imported from a package — must follow the import to resolve it
import defaultConfig, { dir } from '@bynovl/optimize-tests/optimize.config.js';
export default { outDir: dir, ...defaultConfig }
// → read node_modules/@bynovl/optimize-tests/optimize.config.js to find what `dir` resolves to
```

**If `outDir` is imported, read the source package's config file to get the real path:**
```bash
cat node_modules/<package-name>/optimize.config.js
```

### Step 4: Confirm the resolved outDir exists
```bash
ls <resolved-outDir>
```

### Step 5: Identify the source directory for fixes

Optimize reports issues in the **built** HTML (`outDir`), but fixes must be made in the **source** files:

- **Frontmatter issues** (some pages fail) → fix in individual source page files (`.md`, `.html`, etc.) in the project `src/` or content root
- **Template/include issues** (all pages fail the same check) → fix in template files (`layouts/`, `_includes/`, `partials/`, etc.)
- **If the project has no build step** (plain HTML site) → `outDir` is the source; edit files there directly

> ⚠️ **Never skip config resolution.** Fixing files in the wrong directory means changes have no effect and re-running optimize will show the same issues.

---

## Worklows

### Full Site Audit
Run all checks:
```bash
npx optimize
```
Use for initial audit, pre-deployment, CI/CD.

### File-Specific Checks
Check a single file:
```bash
npx optimize --file about/index.html
```
Use for iterative development and targeted fixes.

### Dir-Specific Checks
Check a single directory:
```bash
npx optimize --dir about
```
Use for iterative development and targeted fixes.


### Check-Type Filtering
Run only specific checks:
```bash
npx optimize --meta --hierarchy
npx optimize --schema
npx optimize --accessibility
```
Use for focused validation during development. For example, check only meta tags after updating templates, or only accessibility after adding images.

### Combined Patterns
```bash
# Initial full audit
npx optimize --meta --open-graph --schema > audit.txt
npx optimize --file about/index.html --meta --open-graph
```
Use for efficient workflows: full audit to identify issues, then targeted checks to fix specific problems.  

### CI/CD Mode
```bash
npx optimize --ci
```
Use in CI/CD pipelines. Exits with non-zero code if any issues found, causing build failure. Ensures no issues reach production.

**Available checks:**
- `--meta` - Title, description, keywords, canonical
- `--open-graph` - OG tags, Twitter cards
- `--schema` - JSON-LD structured data
- `--hierarchy` - Heading structure (h1-h6)
- `--accessibility` - Alt tags, ARIA, contrast
- `--links` - Internal/external link validation
- `--media` - Image optimization
- `--sources` - Resource loading*

**Additional options:**
- `--file <path>` - Check specific file
- `--dir <path>` - Check specific directory
- `--ci` - CI/CD mode (non-zero exit on issues)
- `--help` - Show help information
- `--version` - Show version information

---

## Development Workflows

### Workflow 1: Initial Site Setup
```bash
# 1. Build site
npm run build # or npm run serve

# 2. Full audit
npx optimize > seo-audit.txt # save report to file for easier review
npx optimize # view in terminal

# 3. Review issues you can use AI to summarize and prioritize or manually review
cat seo-audit.txt

# 4. Fix systematically (e..g. start with meta. You cn use Github Copilot CLI to generate fixes or fix manually)
npx optimize --meta

# 5. Final check
npx optimize
```

---

### Workflow 2: Page-Specific Development
```bash
# Working on about page
npm run build # npm run serve

# Check just that page
npx optimize --file about/index.html

# Summarize and fix issues on that page
summarize and fix issues

# Rebuild and recheck
npm run build && npx optimize --file about/index.html
```

---

### Workflow 3: CI/CD Integration
```yaml
# .github/workflows/op.yml
name: Validate Site

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Build site
        run: NODE_ENV=production npm run build
      
      - name: Run optimize
        run: npx optimize --ci
```
---

## Interpreting Results

### Summary Report (Example)
```
================= SUMMARY =================
❌ TOTAL CHECKS FAILED: 5
⚠️  TOTAL FAILED ITEMS: 21

FAILED CHECKS:
- Meta: 7 failed item(s)
- Open Graph: 5 failed item(s)
- Schema: 5 failed item(s)
- Hierarchy: 3 failed item(s)
- Accessibility: 1 failed item(s)
```

**Priority order:**
1. **Meta** - Critical for SEO
2. **Schema** - Rich results in search
3. **Open Graph** - Social sharing
4. **Hierarchy** - Accessibility + SEO
5. **Accessibility** - Legal compliance

---

### Issue Anatomy
```
PATH: about/index.html
- Target: <meta name="description">
    Reason: missing description
    Message: include description
```

- **PATH** - File with issue (relative to outDir)
- **Target** - Specific element affected
- **Reason** - Technical cause
- **Message** - Actionable fix

---

## Common Issues

**Key insight for static sites:** Nearly all optimize issues trace back to just **two root causes:**

### 1. Frontmatter Issues (Page-Level)
**Symptoms:** Some pages pass, others fail same check

**Problems:**
- Missing values: `description:` key absent in frontmatter
- Empty values: `description:` present but no content
- Wrong format: String vs array mismatch

**Example:**
```yaml
---
title: About
# ❌ Missing description
keywords: 
# ❌ Empty keywords
---
```

**Fix location:** Individual page files (`.md`, `.html`, etc.)

**Quick test:**
```bash
# Check specific failing page
npx optimize --file failing-page/index.html

# Look at source frontmatter
cat src/failing-page.md
```

---

### 2. Template Include Issues (Site-Wide)
**Symptoms:** All pages fail same check, or entire categories missing

**Problems:**
- Include not added to layout
- Wrong include path
- Conditional logic excluding pages
- Include file has errors/empty content

**Example:**
```liquid
<!-- ❌ Missing meta include -->
<head>
  <meta charset="UTF-8">
  <!-- No {% include 'meta' %} -->
</head>

<!-- ✅ Correct -->
<head>
  <meta charset="UTF-8">
  {% include 'snippets/meta.liquid' %}
  {% include 'snippets/schema.liquid' %}
</head>
```

**Fix location:** Template files (`layouts/`, `_includes/`, `partials/`)

**Quick test:**
```bash
# If ALL pages fail meta check
npx optimize --meta

# Problem is in your meta include/partial
# Check: layouts/default.html or _includes/meta.liquid
```

---

**Examples:**

| Symptom | Root Cause | Fix Location |
|---------|-----------|--------------|
| All pages missing og:image | Template includes | `_includes/meta` |
| 3 blog posts missing keywords | Frontmatter | Those 3 `.md` files |
| No schema on ANY page | Template includes | `_includes/schema` or layout |
| One page has empty description | Frontmatter | That page's `.md` file |
| All pages missing canonical | Template includes | `_includes/meta` |

**Pro tip:** Run `npx optimize` once → Count how many pages fail each check. If it's "all pages", debug templates. If it's "some pages", debug frontmatter.

---

## Best Practices

### 1. Run optimize after every build or during development Integrate into npm scripts:
```json
{
  "scripts": {
    "build": "your-build-command",
    "serve": "your-serve-command",
    "validate": "npm run build && npx optimize"
  }
}
```
> Tip: While running development server, run `npx optimize` to check for issues and fix in one step. This way you catch issues early and avoid accumulating them until pre-deployment.

### 2. Fix issues systematically
Priority order:
1. Fix empty files first (draft issues)
2. Add missing meta tags to templates
3. Fix schema and open graph issues
4. Address hierarchy warnings
5. Polish accessibility
6. Fix links, sources and media last since they are less critical for SEO and more about user experience.

**Diagnosis Decision Tree**

```
Optimize shows errors
    ↓
Is EVERY page failing the same check?
    ↓
YES → Template include issue
      → Check layout files
      → Verify {% include %} statements
      
NO → Frontmatter issue
     → Check individual page frontmatter
     → Add missing values
```

### 3. Use file or directory checks during dev
```bash
# Not every time 
npx optimize

# Yes, frequently
npx optimize --file working-page/index.html --meta

# Yes, frequently
npx optimize --file working-page --meta
```

### 4. Production builds before final check
```bash
# Development has localhost URLs, missing assets
NODE_ENV=development npm run build
npx optimize  # Will show localhost errors

# Production has real URLs
NODE_ENV=production npm run build
npx optimize  # Accurate results
```

---

## Integration with Other Skills

Enhance your workflow by combining optimize with other skills:

### With [SEO Skill](../seo/SKILL.md)
- **SEO skill** = What to implement (theory)
- **Optimize** = Verify implementation (validation and feedback)

**Workflow:**
1. Read SEO skill for best practices
2. Implement in templates
3. Build site
4. Run optimize to verify implementation and catch issues
5. Fix issues optimize finds
6. Repeat

---

## Integration with Github Copilot CLI and AI Tools
Use AI to summarize optimize results and generate fixes:
```bash
# Run optimize and summarize with AI
npx optimize > audit.txt
cat audit.txt | ai-summarize --prioritize
```

---

## Resources

- [Optimize](https://github.com/bynovl/optimize/#readme) - Package repository with documentation
- [Schema.org](https://schema.org/) - Structured data reference
- [a11y Project](https://www.a11yproject.com/) - Accessibility guidelines
- [Open Graph Protocol](https://ogp.me/) - OG tag reference
