import fs from 'fs';
import path from 'path';
import { anchorIdRegex } from '@bynovl/optimize-utils/regex-links.js';
/**
 * Internal link validator.
 * Handles relative paths, hashes, root, and local resources.
 * - Resolves relative links against config.startUrl or config.outDir or baseDir.
 * - Checks for existence in content (HTML string or cache).
 * - Handles hash fragments (checks if ID exists in page).
 * - Ignores external protocols.
 * @param {string} content - The HTML string or cache.
 * @param {string} link - The internal link (relative or absolute).
 * @param {object} config - Config object. Should include startUrl and optionally outDir, isOffline, etc.
 * @param {string} baseDir - Optional base directory.
 * @returns {Promise<object>} - Validation result.
 */

export async function checkLinkValidityInt(content, link, config = {}, sourceFile) {
    // Utility to extract baseDir from sourceFile
    function getBaseDirFromSourceFile(sourceFile) {
        if (!sourceFile) return undefined;
        return path.dirname(sourceFile);
    }
    let baseDir = getBaseDirFromSourceFile(sourceFile);
    try {
        // Ignore mailto, tel, javascript, ftp, and placeholder links ("#" and "")
        if (
            link.startsWith('mailto:') ||
            link.startsWith('tel:') ||
            link.startsWith('javascript:') ||
            link.startsWith('ftp:') ||
            link === '' || link === '#'
        ) {
            // For "" skip check entirely (not even a warning)
            if (link === '' || link === '#') {
                return null;
            }
            return { isError: false, isWarning: true, reason: `Non-HTTP(s) link ignored`, message: link, target: link, sourceFile };
        }

        // Hash-only link: check if the hash exists in the current page or file
        if (link.startsWith('#') && link.split('').length > 1) {
            const hash = link.slice(1);
            // Special case: href="#" or href="" are common placeholders and should not be treated as errors
            if (link === '#' || link === '') {
                return { isError: false, isWarning: false, reason: 'Hash-only placeholder ("#" or empty) is not an error', message: link, target: link, sourceFile };
            }
            const idRegex = anchorIdRegex(hash);
            let htmlToCheck = content;
            // If sourceFile is provided and exists, read HTML from disk for more accuracy
            if (sourceFile && fs.existsSync(sourceFile)) {
                htmlToCheck = fs.readFileSync(sourceFile, 'utf8');
            }
            if (htmlToCheck && typeof htmlToCheck === 'string' && idRegex.test(htmlToCheck)) {
                return { isError: false, isWarning: false, reason: `Hash found`, message: link, target: link, sourceFile };
            }
            return { isError: true, isWarning: false, reason: `Hash "${hash}" not found in HTML`, message: link, target: link, sourceFile };
        }

        // Only use path resolution for local/internal links
        let filePath;
        let relPath = link;
        // Remove query/hash for file path resolution
        relPath = relPath.split('?')[0].split('#')[0];
        if (relPath.startsWith('/')) {
            // Root-relative: resolve from config.outDir (site root)
            relPath = relPath.slice(1);
            baseDir = config.outDir ? config.outDir : (sourceFile ? path.dirname(sourceFile) : process.cwd());
        } else {
            // Relative: resolve from HTML file's directory
            baseDir = sourceFile ? path.dirname(sourceFile) : process.cwd();
        }

        // If no extension, treat as directory and append index.html
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(relPath);
        if (!hasExtension) {
            if (!relPath.endsWith('/')) relPath += '/';
            relPath += 'index.html';
        }

        filePath = path.resolve(baseDir, relPath);
        if (!fs.existsSync(filePath)) {
            let fallbackPath = path.resolve(baseDir, relPath + '.html');
            if (fs.existsSync(fallbackPath)) {
                filePath = fallbackPath;
            } else {
                filePath = undefined;
            }
        }

        // For hash fragments, check the target file for the id
        const hash = link.split('#')[1];
        if (hash) {
            let htmlToCheck = content;
            if (filePath && fs.existsSync(filePath)) {
                htmlToCheck = fs.readFileSync(filePath, 'utf8');
            }
            if (htmlToCheck && typeof htmlToCheck === 'string' && htmlToCheck.includes(`id="${hash}"`)) {
                return { isError: false, isWarning: false, reason: 'Hash found', message: '', target: link };
            }
            return { isError: true, isWarning: false, reason: `Hash "${hash}" not found in HTML`, message: '', target: link };
        }

        // For non-hash internal links, check if the file exists
        if (filePath) {
            const exists = fs.existsSync(filePath);
            if (exists) {
                return null;
            }
        }
        return { isError: true, isWarning: false, reason: `Internal link target file not found`, message: `Validated path: ${link}`, target: link, sourceFile };
    } catch (err) {
        return { isError: true, isWarning: false, reason: `Invalid internal link`, message: err.message, target: link, sourceFile };
    }
}