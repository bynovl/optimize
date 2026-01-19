/**
 * ISSUE_KEY definitions
 *
 * Error: Indicates a definite problem that must be fixed (e.g., broken link, missing file, malformed URL).
 * Warning: Indicates a potential issue, such as an unreachable external link, that may be intermittent or not critical.
 *
 * Error keys: invalidExtLink, invalidIntLink, malformedUrl, invalid, empty, missing, duplicate
 * Warning keys: unreachableExtLink, unreachableIntLink
 */

export const ISSUE_KEY = {
    total: 'total',
    invalidExtLink: 'invalidExtLink', // Error: broken external link
    invalidIntLink: 'invalidIntLink', // Error: broken internal link
    malformedUrl: 'malformedUrl',     // Error: malformed URL
    unreachableExtLink: 'unreachableExtLink', // Warning: external link unreachable or blocked
    unreachableIntLink: 'unreachableIntLink', // Warning: internal link unreachable (rare)
    invalid: 'invalid',               // Error: generic invalid
    empty: 'empty',                   // Error: empty value
    missing: 'missing',               // Error: missing value
    duplicate: 'duplicate',           // Error: duplicate value
};
