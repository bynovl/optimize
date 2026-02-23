// =====================================
// Test configuration for the custom check 
// =====================================
// Pull in the test config; this ensures the
// custom check repository uses the same settings as the tests package
import defaultConfig, { dir } from '@bynovl/optimize-tests/optimize.config.js';

// export a configuration object that is mostly identical to the
// imported default, but override the output directory so that
// generated files end up next to the sample content used by the
// test helpers.
export default {
  ...defaultConfig,
  outDir: dir // use the `dir` value exported by the test config
};