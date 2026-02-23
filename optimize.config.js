import testConfig from './packages/optimize-tests/optimize.config.js';

export default {
  ...testConfig,
  enabledChecks: ['--meta'], // specify which checks to run (default is all)
}