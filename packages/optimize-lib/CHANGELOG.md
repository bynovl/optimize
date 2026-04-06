# @bynovl/optimize-lib

## 2.6.5

### Patch Changes

- 9fb0ecb: Fix missing import; added error handling for ourDir check before execution
- Updated dependencies [9fb0ecb]
  - @bynovl/optimize-utils@2.5.4

## 2.6.4

### Patch Changes

- 04c49dd: Updated docs for consistent formatting; Add support for file with --report arg. Also work without and with config.
- Updated dependencies [04c49dd]
  - @bynovl/optimize-utils@2.5.3

## 2.6.3

### Patch Changes

- f312782: Update docs, fix links; AI report gerneration
- Updated dependencies [f312782]
  - @bynovl/optimize-utils@2.5.2

## 2.6.2

### Patch Changes

- 1a6acea: Fix path location of report export and early execution; updated docs'

## 2.6.1

### Patch Changes

- Updated dependencies [1347819]
  - @bynovl/optimize-utils@2.5.1

## 2.6.0

### Minor Changes

- 59a9d95: Added markdown report generation, edit docs to consider docs ethics documentation

### Patch Changes

- Updated dependencies [59a9d95]
  - @bynovl/optimize-utils@2.5.0

## 2.5.2

### Patch Changes

- 05e191a: Added dynamic functionality to generate step/key logic and remove hard-coded dependencies'

## 2.5.1

### Patch Changes

- 82465e7: Small fix to json or CSV export to silence CLI messaging

## 2.5.0

### Minor Changes

- 1cab28e: Updated from customChecks to extendChecks to ensure module picks up extensions

### Patch Changes

- Updated dependencies [1cab28e]
  - @bynovl/optimize-utils@2.4.0

## 2.4.2

### Patch Changes

- d07edb7: Small patch fix for debugging

## 2.4.1

### Patch Changes

- c96c444: Fix to improve package path detection based on pkg manager'

## 2.4.0

### Minor Changes

- 4679222: Updated modules to use same shared package location detection, refactored code, and removed unused console statements

### Patch Changes

- Updated dependencies [4679222]
  - @bynovl/optimize-utils@2.3.0

## 2.3.4

### Patch Changes

- 7b77f95: Patch fix for agnostic pkg manager support

## 2.3.3

### Patch Changes

- d71c7d5: Test: cross-package manager support for different environments

## 2.3.2

### Patch Changes

- 9549bc1: Patch fix. test.

## 2.3.1

### Patch Changes

- 354bbc7: Fix package resolver detection

## 2.3.0

### Minor Changes

- c20301d: Fix issues with duplicates

## 2.2.1

### Patch Changes

- 09a516d: Prevent duplicates from loading

## 2.2.0

### Minor Changes

- ca0d5f6: Improved module scalability for package detection.

### Patch Changes

- Updated dependencies [ca0d5f6]
  - @bynovl/optimize-utils@2.2.0

## 2.1.2

### Patch Changes

- c06b6ca: Update checkModule logic and cleaned up files and duplicate/redundant instances of code
- Updated dependencies [c06b6ca]
  - @bynovl/optimize-utils@2.1.2

## 2.1.1

### Patch Changes

- 29a2b3e: Fix file extension issues
- Updated dependencies [29a2b3e]
  - @bynovl/optimize-utils@2.1.1

## 2.1.0

### Minor Changes

- f26f5a5: Update package README and refactored core CLI checkModules for auto-detection and re-usability

### Patch Changes

- Updated dependencies [f26f5a5]
  - @bynovl/optimize-utils@2.1.0

## 2.0.1

### Patch Changes

- 5de6d0d: Re-formatted license
- Updated dependencies [5de6d0d]
  - @bynovl/optimize-utils@2.0.1

## 2.0.0

### Major Changes

- 1f78b22: Major refactor of core logic. Improves orchestration and customization settings

### Patch Changes

- Updated dependencies [1f78b22]
  - @bynovl/optimize-utils@2.0.0

## 1.6.1

### Patch Changes

- 002b184: Update to --path from --file and fix issues referencing old nam
- Updated dependencies [002b184]
  - @bynovl/optimize-utils@1.5.1

## 1.6.0

### Minor Changes

- 0d5ee79: Update LICENSE, added Contributing, Code of Conduct and Security files; Improved orchestrator to accept args vs passing a single arg

### Patch Changes

- Updated dependencies [0d5ee79]
  - @bynovl/optimize-utils@1.5.0

## 1.5.0

### Minor Changes

- 64402f6: Update README.md; added SKILL.md to make it easier to analyze results; and improved tests package README instructions for usage'

### Patch Changes

- Updated dependencies [64402f6]
  - @bynovl/optimize-utils@1.4.0

## 1.4.3

### Patch Changes

- b9c8051: Added support for SKILL.md to make it easier to integrate optimize into workflow
- Updated dependencies [b9c8051]
  - @bynovl/optimize-utils@1.3.2

## 1.4.2

### Patch Changes

- 3920d03: Changed package registry
- Updated dependencies [3920d03]
  - @bynovl/optimize-utils@1.3.1

## 1.4.1

### Patch Changes

- ddde536: Fix start url issues

## 1.4.0

### Minor Changes

- 293e6ca: Fix localhost issues with link validation; skip data URI background images

## 1.3.1

### Patch Changes

- 5430b91: Update link validity ext/int orchestrator detection

## 1.3.0

### Minor Changes

- 85c3396: Improve media check; update how ignore list is handled

### Patch Changes

- Updated dependencies [85c3396]
  - @bynovl/optimize-utils@1.3.0

## 1.2.2

### Patch Changes

- e1ad065: Update how empty enabledChecks setting is handled; fix outdated README; and added an example config that can be us used to quickly setup project
- Updated dependencies [e1ad065]
  - @bynovl/optimize-utils@1.2.2

## 1.2.1

### Patch Changes

- ce085a5: License updates
- Updated dependencies [ce085a5]
  - @bynovl/optimize-utils@1.2.1

## 1.2.0

### Minor Changes

- 0f57f17: Improve file and directory check; remove passed check from CLI to minimize bloat

### Patch Changes

- Updated dependencies [0f57f17]
  - @bynovl/optimize-utils@1.2.0

## 1.1.0

### Minor Changes

- f3c1bea: Added support for single file and directory level check

### Patch Changes

- Updated dependencies [f3c1bea]
  - @bynovl/optimize-utils@1.1.0

## 1.0.1

### Patch Changes

- b63a38a: super minor bump to test versioning
- Updated dependencies [b63a38a]
  - @bynovl/optimize-utils@1.0.1
