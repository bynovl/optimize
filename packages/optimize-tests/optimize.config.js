import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

// Use the same output directory as the test project to make sure it works with existing projects without needing to change the config.
const __dirname = dirname(fileURLToPath(import.meta.url));
export const dir = join(__dirname, 'site')

export default {
  schemaDataCustom: [
    'mainEntity.@type',
    'mainEntity.name',
    'mainEntity.acceptedAnswer.@type',
    'mainEntity.acceptedAnswer.text',
  ],
};

// import defaultConfig, { dir } from '@bynovl/optimize-tests/optimize.config.js'
