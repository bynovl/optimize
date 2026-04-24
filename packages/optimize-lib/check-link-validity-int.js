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
        // Ignore mailto, tel, javascript, ftp, and placeholder links ("" and "#")
        if (
            link.startsWith('mailto:') ||
            link.startsWith('tel:') ||
            link.startsWith('javascript:') ||
            link.startsWith('ftp:') ||
            link === '' || link === '#'
        ) {
            if (link === '' || link === '#') return null;
            return { isError: false, isWarning: true, reason: `Non-HTTP(s) link ignored`, message: link, target: link, sourceFile };
        }

        // Helper: test HTML string for the anchor id
        const hasAnchorInHtml = (html, hash) => {
            if (!html || typeof html !== 'string') return false;
            const idRegex = anchorIdRegex(hash);
            return idRegex.test(html);
        };

        // Root-relative hash (e.g. /#section): check root index.html
        if (link.startsWith('/#') && link.length > 2) {
            const hash = link.slice(2);
            const rootDir = config.outDir ? config.outDir : process.cwd();
            const indexPath = path.resolve(rootDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                const html = fs.readFileSync(indexPath, 'utf8');
                if (hasAnchorInHtml(html, hash)) return { isError: false, isWarning: false, reason: `Hash found in root index.html`, message: link, target: link, sourceFile };
            }
            return { isError: true, isWarning: false, reason: `Hash "${hash}" not found in root index.html`, message: link, target: link, sourceFile };
        }

        // Hash-only link (#section): check current page (sourceFile) or provided content
        if (link.startsWith('#') && link.length > 1) {
            const hash = link.slice(1);
            const htmlToCheck = (sourceFile && fs.existsSync(sourceFile)) ? fs.readFileSync(sourceFile, 'utf8') : content;
            if (hasAnchorInHtml(htmlToCheck, hash)) return { isError: false, isWarning: false, reason: `Hash found`, message: link, target: link, sourceFile };
            return { isError: true, isWarning: false, reason: `Hash "${hash}" not found in HTML`, message: link, target: link, sourceFile };
        }

        // Only use path resolution for local/internal links (handles /about, /about#section, relative paths)
        let filePath;
        let relPath = link;
        relPath = relPath.split('?')[0].split('#')[0];
        if (relPath.startsWith('/')) {
            relPath = relPath.slice(1);
            baseDir = config.outDir ? config.outDir : (sourceFile ? path.dirname(sourceFile) : process.cwd());
        } else {
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
            const fallbackPath = path.resolve(baseDir, relPath + '.html');
            if (fs.existsSync(fallbackPath)) {
                filePath = fallbackPath;
            } else {
                filePath = undefined;
            }
        }

        // For links with hash (e.g. /about#section), check the resolved file for the anchor
        const hash = link.split('#')[1];
        if (hash) {
            let htmlToCheck = content;
            if (filePath && fs.existsSync(filePath)) {
                htmlToCheck = fs.readFileSync(filePath, 'utf8');
            } else if (sourceFile && fs.existsSync(sourceFile)) {
                htmlToCheck = fs.readFileSync(sourceFile, 'utf8');
            }
            if (hasAnchorInHtml(htmlToCheck, hash)) return { isError: false, isWarning: false, reason: 'Hash found', message: '', target: link };
            return { isError: true, isWarning: false, reason: `Hash "${hash}" not found in HTML`, message: '', target: link };
        }

        // For non-hash internal links, check if the file exists
        if (filePath) {
            const exists = fs.existsSync(filePath);
            if (exists) return null;
        }
        return { isError: true, isWarning: false, reason: `Internal link target file not found`, message: `Validated path: ${link}`, target: link, sourceFile };
    } catch (err) {
        return { isError: true, isWarning: false, reason: `Invalid internal link`, message: err.message, target: link, sourceFile };
    }
}