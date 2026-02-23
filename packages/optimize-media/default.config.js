import globalConfig from '@bynovl/optimize-lib/set-config.js';

// Cutsom CLI module config settings
export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    mediaTypes: ['video', 'audio', 'embed', 'img'],
    inlineStyles: true,
    styleBlocks: true,
    cssFiles: true,
    htmlFiles: true,
    someValue: 'default'
}

export default DEFAULT_CONFIG_SETTINGS;