// Export all checks as a single function
/**
 * Run all checks on a document.
 * Can be used internally or externally as a unified API wrapper with start URL support.
 */
export { runAllChecks } from '@bynovl/optimize/index.js';
// For single checks, defne checks in the optimize.config.js
// enabledChecks: ['--meta', '--links', '--media']

// Export single checks for granular control (future use)
// Intend to be used for local checks or custom orchestrators
export { default as checkMeta } from '@bynovl/optimize-meta/index.js';
export { default as checkLinks } from '@bynovl/optimize-links/index.js';
export { default as checkMedia } from '@bynovl/optimize-media/index.js';
export { default as checkSchema } from '@bynovl/optimize-schema/index.js';
export { default as checkAccessibility } from '@bynovl/optimize-accessibility/index.js';
export { default as checkHierarchy } from '@bynovl/optimize-hierarchy/index.js';
export { default as checkOpenGraph } from '@bynovl/optimize-open-graph/index.js';
export { default as checkSources } from '@bynovl/optimize-sources/index.js';

// Supported custom example check, can be used as a template for your own custom checks
// export { validateCheck as validateCustomCheck } from './custom-check-example/validate-check.js';