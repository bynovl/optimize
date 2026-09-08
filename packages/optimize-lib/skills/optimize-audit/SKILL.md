---
name: optimize-audit
description: Generate and maintain a deterministic, shareable Markdown audit report. Focused audit skill that treats the report artifact as the canonical handoff document for downstream steps.
license: Custom source-available (see LICENSE in repository)
metadata:
  author: NOVL
  repository: https://github.com/bynovl/optimize
  version: "0.2"
---

# Skill: Optimize - Audit

## Role

* Own the audit file lifecycle: generate and edit the Markdown report artifact.
* Produce deterministic report structure and evidence so diffs remain stable in CI.
* Preserve recommendation scaffolds by default, and populate recommendation sections only when explicitly requested.

## Scope and ownership
* This skill is the report writer and editor.
* This skill can call interpreter insights, but it owns the final Markdown file content.
* High-level prioritization logic belongs to `optimize-analyze`.

## When to use
* You need a human-readable audit report (`audit.md` or the path in `report.fileOutput`).
* You need to refine an existing report while preserving heading structure and data.
* You need recommendation sections updated in the report artifact.

## Inputs
* `audit.md` (or configured `report.fileOutput` path in the `optimize.config.js`) is the primary source of truth for this skill.
* If no report exists yet, generate one with `npx optimize --report`, then use that generated report as the baseline artifact.
* Optional interpreter output for recommendation population.

## Output contract
There are two stages of output for this skill as follows: 

### Stage 1 (Deterministic baseline)
The engine generates the original report artifact (`audit.md` or configured report path). This artifact is the evidence snapshot that the AI will use as the source of truth for any edits.  The artifact:
* includes summary, category sections, findings, and recommendation scaffolds.
* treats engine-generated evidence blocks as immutable.
* does not invent, recalculate, or manipulate audit data.
* keeps recommendation sections blank/template-only unless recommendation population is requested.

### Stage 2 (AI refinement)
The AI edits only allowed narrative and recommendation areas under the rules below. Final output rule: preserve all Stage 1 evidence blocks verbatim. It should be a professional grade actionable audit that's human friendly. Use this as the authoritative fill policy for the report artifact:

* `# Website Audit Report` and metadata block (`Date`, `Prepared by`): always include; never edit values.
* `## Summary`: always include; AI may rewrite wording but must preserve numeric meaning.
* `## Categories`: always include when category findings exist.
* `### <category name>`: immutable heading labels; do not rename, reorder, add, or remove.
* `Totals` and `Score` lines per category: immutable values; never recalculate or edit numbers.
* `Top Pages`: immutable page list/ranking; never edit unless a full regenerate is explicitly requested.
* `Findings` table: immutable evidence rows; do not rewrite issue facts, severity, counts, URLs, or statuses.
* `Recommendations` heading and table scaffold: always include.
  * Generate/refine modes: keep scaffold/template-only.
  * Populate-recommendations mode: fill with actionable content; may use `optimize-analyze` insights.
* `## Next Steps`: always include; AI may refine wording, but must keep deterministic handoff intent and data grounding.

**Allowed Edit permissions (explicit)**
AI may edit:
* narrative prose in `Summary` and `Next Steps`.
* recommendation table row content only when recommendation population is requested. Do not edit table headers.

**Disallowed Edit permissions (explicit)**
* category headings.
* totals, scores, counts, or any other numeric evidence.
* top pages data.
* findings table evidence content.
* section order and heading hierarchy.

## Modes
### Generate
* Build a new report artifact from engine output.
* Path behavior:
  * `--report` writes to `audit.md`.
  * `--report <filename>.md` writes to the provided filename.
  * `report.fileOutput` is used when no CLI report path override is provided.

### Refine
* Read existing report and update section content in place as instructed in **Stage 2 (AI refinement)** above.
* Write to the same path unless a new output path is explicitly requested (for example `*-revised.md`).
* Keep findings unchanged.
* Do not alter section headings or evidence tables.
* **Editing rule**: use the existing scaffolds and only update content explicitly allowed by Stage 2. If use prompt provides guidance, follow that guidance first. If no specific guidance is provided, fallback to Stage 2 rules.
* Use **insights** from `optimize-analyze`, but do not alter the table structure or headings.
* Keep evidence grounded in the report artifact.
* Never invent findings not present in source data.

## Workflow
1. Resolve target report path with precedence: `--report <filename>.md` > `--report` (default `audit.md`) > `report.fileOutput`.
2. If target report exists and request is refine/update, load that report and edit by section.
3. If target report does not exist, run the engine to generate the baseline report artifact.
4. If recommendation population is requested, enrich only recommendation sections.
5. Write final Markdown to the same file unless a new output path is requested.

## Trigger guidance
| Trigger | Mode |
|---------|------|
| `audit`, `run audit`, `generate report` | Generate mode |
| `refine`, `improve`, `revise`, `rewrite report` | Refine mode |
| `populate recommendations`, `update recommendations`, `fill recommendations` | Populate-recommendations mode |

### Example Prompts 
The following are example prompts that illustrate how to trigger the different modes of this skill. There are many ways to phrase these requests, but the examples below are representative of the intent and expected output:

- Generate an audit report from the latest run and save it to audit.md.
- Run audit and write the report to seo-audit.md.
- Refine this existing audit for clarity, but do not change Findings, Top Pages, or category scores.
- Rewrite Summary and Next Steps to be more executive-friendly without altering any numeric evidence.
- Populate recommendations for all categories using the existing findings only.
- Update recommendation rows for Accessibility and Links only, keep all evidence tables unchanged.
- Create a revised copy at audit-revised.md with improved narrative and preserved evidence blocks.
- Keep recommendation scaffolds blank and only tighten wording in Summary.
- Regenerate the report baseline, then re-apply refinement rules.
- Use optimize-analyze insights to fill recommendations with Priority, Action, Why, How, Effort, Impact, and Evidence.

## Integration
* With `optimize-analyze`: consume analysis output when recommendation filling is requested.
* With `optimize-find`: use queried findings as supporting context, but keep the audit markdown artifact as source of truth for handoff output.
