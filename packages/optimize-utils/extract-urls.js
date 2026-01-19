import { walkKeys } from './walk.js';

export function extractUrls(obj) {
    const urls = [];
    walkKeys(obj, (key, value, currentPath) => {
        if (typeof value === 'string' && /^https?:\/\//.test(value)) {
            urls.push({ url: value, keyPath: currentPath });
        }
    });
    return urls;
}
