import globalConfig from '@bynovl/optimize-lib/set-config.js';

export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    processingType: 'default', // or 'concurrent', 'max'
    processingSize: 25,        // batch size or max links
};
// Debug: show links default config
export default DEFAULT_CONFIG_SETTINGS;