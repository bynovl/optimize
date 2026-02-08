---
name: optimize
description: Post-build validation tool for static sites. Use when asked to "check SEO", "validate site", "run optimize", "check accessibility", "check meta", "check schema", "check links", "check media", "check hierarchy", "check schema" or "check open graph". Run after building to catch issues before deployment.
license: Custom source-available (see LICENSE in package repository)
metadata:
  author: Novl
  repository: https://github.com/bynovl/optimize
  version: "1.0"
---

# Optimize - Static Site Validation

Post-build CLI tool for static site validation. Analyzes built HTML for SEO, accessibility, meta, schema, links, and media issues. Works with any static site generator. Ideal for pre-deployment checks and CI/CD.

## Quick Start

Install:
```bash
pnpm add -D @bynovl/optimize
# or
npm install -D @bynovl/optimize
```

Configure `optimize.config.js`:
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

## Usage

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
- `--sources` - Resource loading

---

## Development Workflows

### Workflow 1: Initial Site Setup
```bash
# 1. Build site
npm run build

# 2. Full audit
npx optimize > seo-audit.txt

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
npm run build

# Check just that page
npx optimize --file about/index.html

# Fix issues in about.md

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

### 1. Run optimize after every build
```json
{
  "scripts": {
    "build": "your-build-command",
    "validate": "npm run build && npx optimize",
    "deploy": "npm run validate && deploy-command"
  }
}
```

### 2. Fix issues systematically
Priority order:
1. Fix empty files first (draft issues)
2. Add missing meta tags to templates
3. Fix schema/OG issues
4. Address hierarchy warnings
5. Polish accessibility


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

### 3. Use file checks during dev
```bash
# Not every time
npx optimize

# Yes, frequently
npx optimize --file working-page/index.html --meta
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

## Resources

- [Optimize GitHub](https://github.com/bynovl/optimize)
- [Schema.org](https://schema.org/) - Structured data reference
- [a11y Project](https://www.a11yproject.com/) - Accessibility guidelines
- [Open Graph Protocol](https://ogp.me/) - OG tag reference
