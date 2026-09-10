---
name: optimize-fix
description: Specialized skill for implementing fixes identified by Optimize. Use when asked to "fix the audit errors", "remediate SEO issues", "correct meta tags", "fix broken links", or "apply accessibility fixes". Focuses on tracing errors from built HTML back to source templates and frontmatter.
license: Custom source-available (see LICENSE in package repository)
metadata:
  author: NOVL
  version: "1.0"
---

# Optimize Fix

The Optimize Fix is the remediation skill of the Optimize toolchain. Its sole purpose is to resolve issues identified in the `o-results.json` files by modifying the **source files** of the static site.

## Role 

You are the **Fixer**. Your job is to trace errors from the built HTML back to the source templates and frontmatter, and then apply safe, deterministic fixes.

**You must NEVER edit files located in the `outDir` (the build output directory).** The `outDir` contains auto-generated HTML. Any changes made there will be overwritten the next time the site is built. 

**Your workflow must always be:**
1. Reference the issue in `o-results.json` and locate the error in the **built HTML** (`outDir`).
2. Trace the error back to the **source origin** (Template or Frontmatter).
3. Apply the fix in the **source file** (e.g. .liquid, .njk, .md, .js).

---

## Input 
The skill relies on the `o-results.json` file produced by the Optimize audit. If one does not exist, run `npx optimize --json` to generate it. The name and location of the source and build directories used to determine paths to source files and built HTML are provided by the orchestrator.

If evidence is missing or ambiguous, stop and request clarification before proposing edits.

## Output 
A deterministic remediation response that includes:
- Proposed or applied source-file edits.
- Files touched (or files that would be touched in plan mode).
- Skipped issues with explicit reasons.
- Verification steps for the affected checks.

## Modes
- **Plan mode (default)**: Analyze and propose edits only. No file writes.
- **Apply-safe mode**: Apply low-risk targeted edits.
- **Apply-risky mode**: Allowed only after explicit user approval and scope confirmation.

| Edit Type | Safe | Risky |
|-----------|------|-------|
| Frontmatter metadata update | Add missing `description` key to one page with clear schema match | Renaming or restructuring frontmatter keys across many files |
| Template tag insertion | Add a missing `<meta>` tag in existing `<head>` block | Moving large template blocks or changing include hierarchy |
| Conditional logic change | Tighten an existing condition tied to the failing check | Rewriting conditional flows that affect unrelated rendering |
| Link or attribute correction | Fix a broken URL or incorrect attribute in place | Bulk find/replace across many templates without scoped evidence |
| File scope | Single-file targeted edit | Multi-file cross-template refactor |

## Safety Gates
- Never edit files in `outDir`.
- Use targeted insert/replace/remove edits only.
- Do not perform full-file rewrites without explicit user approval.
- Ensure rollback path exists before writes (Git checkpoint or per-file backup).
- If rollback path cannot be created, do not write files.

## Ambiguity Stop Rules
Stop and ask for clarification when:
- Multiple source files are plausible and confidence is low.
- Templating origin cannot be determined from evidence.
- Required metadata schema or expected key format is unknown.
- Proposed fix would alter unrelated behavior outside the failing target.

## Tracing & Diagnosis
Before applying any fix, you must determine the **Origin of the Issue**.

### 1. The "All-Pages" Pattern (Template Issue)
**Symptom**: A specific check fails across nearly every page in the audit.
**Origin**: A layout file, a partial, or a global include.
**Fix Location**: `layouts/`, `_includes/`, `components/`, `partials/`, etc.
**Common Patterns**:
- **Missing Tag**: An `{% include 'meta' %}` is missing from the `<head>` of the main layout.
- **Wrong Logic**: A conditional (e.g., `{% if page.seo %}`) is preventing tags from rendering.
- **Syntax Error**: A typo in the templating language (Liquid, Nunjucks, Hugo GoTemplates, etc.) is causing the block to be ignored.

### 2. The "Some-Pages" Pattern (Frontmatter Issue)
**Symptom**: A specific check fails on only a few pages, while others pass.
**Origin**: The individual source page file.
**Fix Location**: `.md`, `.html`, or `.json` files in the content root (e.g., `src/blog/post-1.md`).
**Common Patterns**:
- **Missing Key**: The `description:` key is completely absent from the YAML frontmatter.
- **Empty Value**: The key exists (`description: `), but there is no content.
- **Data Type Mismatch**: A value is provided as a list when a string is expected.

---


## Frontmatter Guide

- If only some pages fail, fix metadata in those page files first.
- If all pages fail the same metadata check, treat it as a template/include issue (See "Templating Language Guide" below).

```yaml
---
# Example frontmatter for a page with SEO metadata
meta:
  title: "My Page Title"
  description: "A brief description of the page for SEO and social sharing."
  keywords: ["keyword1", "keyword2", "keyword3"]
  og_image: "/assets/images/og-image.jpg"
  twitter_card: "summary_large_image"
---
```

Refer to [yaml](https://yaml.org/spec/1.2/spec.html) documentation for proper syntax and formatting. Always validate your YAML after editing to avoid issues.

## Templating Language Guide

When there's a sitewide issue, the fix will likely be in a template or include file. The syntax will depend on the templating language used by the static site generator. Adapt to the specific syntax of the project to provide correct remediation. **ALWAYS** check the file extensions and existing code for patterns before applying a fix. Avoid introducing new syntax or structures that are inconsistent with the project.

| Language | Common Patterns / Syntax to Watch | Fix Example |
|----------|-----------------------------------|-------------|
| **Nunjucks** (11ty) | `{{ title }}`, `{% include "meta.njk" %}` | `{% if description %}<meta name="description" content="{{ description }}">{% endif %}` |
| **Liquid** (Jekyll/Shopify) | `{{ page.title }}`, `{% include 'snippet' %}` | `{{ page.description | default: site.default_description }}` |
| **JSX/TSX** (Next.js/Gatsby) | `<Head>`, `props.meta` | `<meta name="description" content={pageData.description} />` |
| **Handlebars/Mustache** | `{{title}}`, partial includes | `{{#if description}}<meta name="description" content="{{description}}">{{/if}}` |
| **Vue** (Vue/Nuxt) | `<template>`, `useHead`, `definePageMeta` | `useHead({ meta: [{ name: 'description', content: description }] })` |
| **Svelte** (SvelteKit) | `<svelte:head>`, `{#if}`/`{#each}`, route/layout head defaults | `<svelte:head>{#if description}<meta name="description" content={description} />{/if}</svelte:head>` |
| **Astro** | frontmatter `---`, `Astro.props`, layout head composition | `<meta name="description" content={Astro.props.description} />` |
| **EJS** | `<%= title %>`, includes | `<% if (description) { %><meta name="description" content="<%= description %>"><% } %>` |
| **Plain HTML** | Static tags | `<meta name="description" content="My Page Description">` |

**Common source locations for template issues:**
- `layouts/` (main layout files)
- `_includes/` (Jekyll includes)
- `components/` (React/Vue components)
- `templates/` (custom template directories)
- `snippets/` (shared HTML/Liquid snippets)

**Refer to the templating language documentation for the specific syntax and best practices based on the projects source code**

- [Liquid](https://shopify.github.io/liquid/)
- [Nunjucks](https://mozilla.github.io/nunjucks/templating.html)
- [React (JSX/TSX)](https://react.dev/learn/writing-markup-with-jsx)
- [Handlebars/Mustache](https://handlebarsjs.com/guide/)
- [EJS](https://ejs.co/)
- [Vue.js Templates](https://vuejs.org/guide/essentials/template-syntax.html)
- [Svelte Markup](https://svelte.dev/docs/svelte/basic-markup)
- [Astro Layouts](https://docs.astro.build/en/basics/layouts/)

---

## Step-by-Step Fix Workflow

For every issue you are asked to fix, you **must** follow these steps:

### Step 1: Evidence Collection
Read `results.json` to identify the exact `target` and `reason`.
Example: `Target: <meta name="description">`, `Reason: missing description`.

### Step 2: Pattern Analysis
Count the occurrences.
- **All pages failing?** $\rightarrow$ Go to **Template Fix** path.
- **Subset of pages failing?** $\rightarrow$ Go to **Frontmatter Fix** path.

### Step 3: Source Location
Locate the file. 
- For templates: Search for the HTML fragment in `layouts/` or `_includes/`.
- For frontmatter: Open the source `.md` file corresponding to the failing path in `outDir`.

### Step 4: Implementation
Apply the fix using the correct templating syntax. Ensure you are not breaking other functionality.

### Step 5: Verification Instruction
Tell the user exactly how to verify the fix:
`Build site` $\rightarrow$ `npx optimize --file <path>` $\rightarrow$ `Verify issue is gone`.

---

## Interaction Examples

**User**: *"Fix the missing meta descriptions found in the audit."*
**AI**:
1. (Reads `results.json`) $\rightarrow$ "I see 42 pages are missing meta descriptions."
2. (Analysis) $\rightarrow$ "Since nearly all pages are affected, this is a **Template Issue**."
3. (Locates Source) $\rightarrow$ "I found the `<head>` section in `_includes/head.html` is missing the description tag."
4. (Fixes) $\rightarrow$ "I will add `{% include 'meta-description' %}` to `_includes/head.html`."
5. (Instruction) $\rightarrow$ "Please rebuild your site and run `npx optimize --meta` to verify."

## Integration with other Skills
- `optimize-analyze`: prioritize which fixes to apply first based on impact and effort.