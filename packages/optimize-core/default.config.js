import { DEFAULT_CONFIG_SETTINGS as metaConfig } from '@bynovl/optimize-meta/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as accessibilityConfig } from '@bynovl/optimize-accessibility/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as linksConfig } from '@bynovl/optimize-links/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as mediaConfig } from '@bynovl/optimize-media/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as openGraphConfig } from '@bynovl/optimize-open-graph/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as schemaConfig } from '@bynovl/optimize-schema/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as sourcesConfig } from '@bynovl/optimize-sources/default.config.js';
import { DEFAULT_CONFIG_SETTINGS as langConfig } from '../optimize-lang/default.config.js';
// Custom check default configuration settings.
// import { DEFAULT_CONFIG_SETTINGS as customCheckConfig } from 'path-to-custom-check/default.config.js'; --- IGNORE ---

// This file defines the default configuration settings for the custom check example.
import defaultConfig from '@bynovl/optimize-lib/set-config.js';
import mergeConfig from '@bynovl/optimize-lib/merge-config.js';

export const DEFAULT_CONFIG_SETTINGS = mergeConfig(
    defaultConfig,
    metaConfig,
    accessibilityConfig,
    linksConfig,
    mediaConfig,
    openGraphConfig,
    schemaConfig,
    sourcesConfig,
    langConfig,
    // customCheckConfig, 
    // customCheckConfig2
);