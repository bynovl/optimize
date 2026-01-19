export default {
  outDir: 'site',
  schemaDataCustom: [
    'mainEntity.@type',
    'mainEntity.name',
    'mainEntity.acceptedAnswer.@type',
    'mainEntity.acceptedAnswer.text',
  ],
};

// Testing from existing project:
// In root optimize.config.js set:
// outDir: 'node_modules/@bynovl/optimize-tests/site'