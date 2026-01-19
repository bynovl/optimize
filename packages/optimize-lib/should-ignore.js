import path from 'path';

export default function shouldIgnore(config, relPath) {
    const ignoreList = config.ignore || [];
    const ignoreExtensions = config.ignoreExtensions || [];
    // Normalize relPath to use forward slashes and no leading slash
    const normRelPath = relPath.replace(/\\/g, '/').replace(/^\//, '');
    // Check extension ignore
    const ext = path.extname(normRelPath).replace('.', '').toLowerCase();
    if (ignoreExtensions.includes(ext)) {
        return true;
    }
    return ignoreList.some((entry) => {
        // Normalize entry
        const normEntry = entry.replace(/\\/g, '/').replace(/^\//, '');
        if (normEntry.endsWith('/')) {
            // Directory: match if relPath starts with entry or is exactly the directory
            return (
                normRelPath === normEntry.slice(0, -1) ||
                normRelPath.startsWith(normEntry)
            );
        }
        // File: exact match
        return normRelPath === normEntry;
    });
}

// // --- test cases ---
// // Given the following config:
// const config = {
//     ignore: ['check-meta/', 'index.html'],
//     ignoreExtensions: ['pdf']
// };

// shouldIgnore(config, 'check-meta/page.html')
// shouldIgnore(config, 'check-meta')
// shouldIgnore(config, 'index.html')
// shouldIgnore(config, 'about.html')
// shouldIgnore(config, 'document.pdf')
// shouldIgnore(config, 'images/photo.jpg')   