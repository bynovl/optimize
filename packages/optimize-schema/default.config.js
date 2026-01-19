import globalConfig from '@bynovl/optimize-lib/set-config.js';

export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    schemaDataDefault: ['@context', '@type', 'name'],
    schemaDataCustom: [],
    schemaDataExceptions: ['image']
}

export default DEFAULT_CONFIG_SETTINGS;