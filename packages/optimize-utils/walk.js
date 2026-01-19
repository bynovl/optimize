import fs from 'fs';
import { resolvePath } from './resolve-path.js';

// Walk through a directory and return a list of files with specific extensions
function walk(dir, filelist = [], exts = ['.html']) {
    fs.readdirSync(dir).forEach((file) => {
        const filepath = resolvePath(file, dir);
        if (fs.statSync(filepath).isDirectory()) {
            walk(filepath, filelist, exts);
        } else if (exts.some((ext) => filepath.endsWith(ext))) {
            filelist.push(filepath);
        }
    });
    return filelist;
}

// Walk through the keys of an object
function walkKeys(obj, callback, keyPath = '') {
    if (typeof obj !== 'object' || obj === null) return;
    if (Array.isArray(obj)) {
        // For arrays, keep parent keyPath and recurse into each element
        for (const el of obj) {
            walkKeys(el, callback, keyPath);
        }
        return;
    }
    for (const key in obj) {
        const value = obj[key];
        const currentPath = keyPath ? `${keyPath}.${key}` : key;
        if (callback(key, value, currentPath, obj) === false) continue;
        if (typeof value === 'object' && value !== null) {
            walkKeys(value, callback, currentPath);
        }
    }
}

// Walk through headings (and nested children if present)
function walkHeadings(arr, callback, parentPath = '') {
    arr.forEach((el, idx) => {
        const path = parentPath ? `${parentPath}.${idx}` : `${idx}`;
        if (el && el.tag && /^h[1-6]$/.test(el.tag)) {
            callback(el.tag, el, path, arr);
        }
        // If your structure is nested, recurse:
        if (el.children && Array.isArray(el.children)) {
            walkHeadings(el.children, callback, path);
        }
    });
}

export { walk, walkKeys, walkHeadings };
