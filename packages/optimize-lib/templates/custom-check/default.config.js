// Default configuration for this check. Customize values below as needed.
// globalConfig provides shared defaults (paths, ignores, etc.).
import globalConfig from '@bynovl/optimize-lib/set-config.js';

// add custom settings below; globalConfig must remain included
export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    // uniqueSettingForCustomCheck: 'default value',
    // anotherCustomSetting: true,
    defaultLang: 'en' // example custom setting
}

export default DEFAULT_CONFIG_SETTINGS;