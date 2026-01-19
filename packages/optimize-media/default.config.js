import globalConfig from '@bynovl/optimize-lib/set-config.js';


// Cutsom CLI module config settings
export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    mediaTypes: ['video', 'audio', 'embed', 'img'],
    inlineStyles: true,
    scriptFiles: true,
    cssFiles: true,
    htmlFiles: true
}

export default DEFAULT_CONFIG_SETTINGS;