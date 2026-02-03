import path from 'path';

export default function shouldIgnore(config, relPath) {
    // console.log('Checking ignore for:', config.ignore, relPath);
    const ignoreList = config.ignore || [];
    // Normalize relPath to use forward slashes and no leading slash
    let normRelPath = relPath.replace(/\\/g, '/');
    if (normRelPath.startsWith('/')) normRelPath = normRelPath.slice(1);
    const ext = path.extname(normRelPath).replace('.', '').toLowerCase();

    return ignoreList.some((entry) => {
        // Normalize entry
        let normEntry = entry.replace(/\\/g, '/');
        if (normEntry.startsWith('/')) normEntry = normEntry.slice(1);
        // Extension pattern: '*.xml' or similar
        if (normEntry.startsWith('*.')) {
            const patternExt = normEntry.slice(2).toLowerCase();
            return ext === patternExt;
        }
        if (normEntry.endsWith('/')) {
            // Directory: match if relPath starts with entry (directory) or is exactly the directory
            return (
                normRelPath === normEntry.slice(0, -1) ||
                normRelPath.startsWith(normEntry)
            );
        }
        return normRelPath === normEntry;
    });
}