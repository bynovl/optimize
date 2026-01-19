import { ISSUE_KEY } from '@bynovl/optimize-lib/issue-keys.js';
import { walkKeys } from '@bynovl/optimize-utils/walk.js';
import { checkLinkValidity } from '@bynovl/optimize-lib/check-link-validity.js';

// REGEX
const schemaRegex =
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

// Validate keys using dot-path recursion
function checkSchemaPath(item, obj, idx, segments, required, parentBlockPath) {
    if (!segments.length) return;
    const seg = segments[0];
    if (Array.isArray(obj)) {
        obj.forEach((itemArr, arrIdx) => {
            checkSchemaPath(
                item,
                itemArr,
                idx,
                segments,
                required,
                parentBlockPath + `[${arrIdx}]`
            );
        });
        return;
    }
    if (typeof obj !== 'object' || obj === null) return;
    if (segments.length === 1) {
        // Last segment: check for key existence and value
        const keyExists = Object.prototype.hasOwnProperty.call(obj, seg);
        const keyValue = keyExists ? obj[seg] : undefined;
        const isEmpty =
            keyValue === null ||
            keyValue === undefined ||
            (typeof keyValue === 'string' && keyValue.trim() === '') ||
            (Array.isArray(keyValue) && keyValue.length === 0);
        if (!keyExists) {
            item.schema.results.push({
                block: idx + 1,
                parentBlock: parentBlockPath,
                target: seg,
                reason: `missing${seg.charAt(0).toUpperCase() + seg.slice(1)}`,
                type: ISSUE_KEY.missing,
                isError: required,
                isWarning: !required,
                message: `Required schema key '${seg}' is missing in block ${parentBlockPath}.`,
            });
        } else if (isEmpty) {
            item.schema.results.push({
                block: idx + 1,
                parentBlock: parentBlockPath,
                target: seg,
                reason: `empty${seg.charAt(0).toUpperCase() + seg.slice(1)}`,
                type: ISSUE_KEY.empty,
                isError: required,
                isWarning: !required,
                message: `Schema key '${seg}' is present but empty in block ${parentBlockPath}.`,
            });
        }
    } else {
        // Not last segment: recurse
        if (Object.prototype.hasOwnProperty.call(obj, seg)) {
            checkSchemaPath(
                item,
                obj[seg],
                idx,
                segments.slice(1),
                required,
                parentBlockPath ? parentBlockPath + '.' + seg : seg
            );
        } else {
            // If parent exists but child key is missing
            item.schema.results.push({
                block: idx + 1,
                parentBlock: parentBlockPath,
                target: seg,
                reason: `missing${seg.charAt(0).toUpperCase() + seg.slice(1)}`,
                type: ISSUE_KEY.missing,
                isError: required,
                isWarning: !required,
                message: `Required child schema key '${seg}' is missing in block ${parentBlockPath}.`,
            });
        }
    }
}
function validateSchemaKeys(
    item,
    parsed,
    idx,
    allParsedKeys,
    rootBlockName = ''
) {
    for (const { path: keyPath, required } of allParsedKeys) {
        const segments = keyPath.split('.');
        if (segments.length > 1) {
            let parentExists = true;
            let current = parsed;
            for (let i = 0; i < segments.length - 1; i++) {
                if (
                    current &&
                    Object.prototype.hasOwnProperty.call(current, segments[i])
                ) {
                    current = current[segments[i]];
                } else {
                    parentExists = false;
                    break;
                }
            }
            if (parentExists) {
                checkSchemaPath(item, parsed, idx, segments, required, rootBlockName);
            }
        } else {
            checkSchemaPath(item, parsed, idx, segments, required, rootBlockName);
        }
    }
}
export async function extractJsonLd(item, content, siteDir, allParsedKeys, startUrl) {
    const jsonldMatches = [...content.matchAll(schemaRegex)];
    if (jsonldMatches.length === 0) {
        item.schema.results.push({
            block: null,
            parentBlock: null,
            target: null,
            reason: 'missingSchemaBlock',
            type: ISSUE_KEY.missing,
            isError: true,
            isWarning: false,
            message: 'No <script type="application/ld+json"> block found on page.',
        });
    } else {
        for (const [idx, match] of jsonldMatches.entries()) {
            let parsed;
            try {
                parsed = JSON.parse(match[1].trim());
            } catch (e) {
                item.schema.results.push({
                    block: idx + 1,
                    parentBlock: null,
                    target: null,
                    reason: 'invalidSchemaBlock',
                    type: ISSUE_KEY.invalid,
                    isError: true,
                    isWarning: false,
                    message: 'Invalid JSON in <script type="application/ld+json"> block.',
                });
                continue;
            }
            const rootBlockName =
                parsed['@type'] || parsed['@id'] || parsed['name'] || '';
            validateSchemaKeys(item, parsed, idx, allParsedKeys, rootBlockName);
            await walkKeys(parsed, async (key, value, currentPath) => {
                if (
                    typeof value === 'string' &&
                    (/^https?:\/\//.test(value) || /^\//.test(value))
                ) {
                    // Special handling for localhost URLs
                    if (/^https?:\/\/localhost(:\d+)?\//.test(value)) {
                        try {
                            const url = new URL(value);
                            const filePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                            const resolvedPath = siteDir + '/' + filePath;
                            const fs = await import('fs');
                            if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
                                // Valid localhost URL, file exists
                                return;
                            } else {
                                item.schema.results.push({
                                    block: idx + 1,
                                    parentBlock: rootBlockName
                                        ? `${rootBlockName}${currentPath ? '.' + currentPath : ''}`
                                        : currentPath,
                                    target: key,
                                    type: ISSUE_KEY.invalidIntLink,
                                    reason: 'brokenSchemaUrl',
                                    isError: true,
                                    isWarning: false,
                                    message: `Localhost URL '${value}' in schema block does not resolve to a file in the site directory.`,
                                });
                                return;
                            }
                        } catch (e) {
                            // Malformed localhost URL
                            item.schema.results.push({
                                block: idx + 1,
                                parentBlock: rootBlockName
                                    ? `${rootBlockName}${currentPath ? '.' + currentPath : ''}`
                                    : currentPath,
                                target: key,
                                type: ISSUE_KEY.malformedUrl,
                                reason: 'brokenSchemaUrl',
                                isError: true,
                                isWarning: false,
                                message: `Malformed localhost URL '${value}' in schema block.`,
                            });
                            return;
                        }
                    }
                    // Pass the actual value directly to checkLinkValidity
                    const linkResult = await checkLinkValidity(content, value, { outDir: siteDir }, null, startUrl);
                    if (linkResult && linkResult.isError === true) {
                        let customMsg = '';
                        if (linkResult.type === 'invalidExtLink') {
                            customMsg = `External URL '${value}' in schema block is invalid or unreachable.`;
                        } else if (linkResult.type === 'invalidIntLink') {
                            customMsg = `Internal URL '${value}' in schema block is invalid or missing.`;
                        } else {
                            customMsg = linkResult.message || '';
                        }
                        item.schema.results.push({
                            block: idx + 1,
                            parentBlock: rootBlockName
                                ? `${rootBlockName}${currentPath ? '.' + currentPath : ''}`
                                : currentPath,
                            target: key,
                            type: linkResult.type,
                            reason: 'brokenSchemaUrl',
                            isError: true,
                            isWarning: false,
                            message: customMsg,
                        });
                    }
                }
            });
        }
    }
}
