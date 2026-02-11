// This file defines the default configuration settings for the custom check example.
// To customize the configuration for your check, you can edit the properties in the DEFAULT_CONFIG_SETTINGS object.
// You can also add new properties as needed for your check's specific configuration options.
// The globalConfig imported from optimize-lib/set-config.js includes common configuration settings that are shared across all checks,
// such as input paths, ignore patterns, and other general settings. By spreading globalConfig into DEFAULT_CONFIG_SETTINGS,
// you ensure that your custom check has access to these common settings while also allowing you to define any custom settings specific to your check.
import globalConfig from '@bynovl/optimize-lib/set-config.js';

export const DEFAULT_CONFIG_SETTINGS = {
    ...globalConfig,
    uniqueSettingForCustomCheck: 'default value', // Example of a custom setting specific to this check. Replace with actual settings as needed.
    anotherCustomSetting: true // Another example setting. Add or replace with actual settings for your check.
}

export default DEFAULT_CONFIG_SETTINGS;