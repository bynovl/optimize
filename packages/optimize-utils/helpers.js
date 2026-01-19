import { walkKeys } from './walk.js';

function checkIfIdExists(content, id) {
    // Parse HTML content to check if specific ID exists
    const idRegex = new RegExp(`id=["']${id}["']`, 'i');
    return idRegex.test(content);
}

function extractUrls(obj) {
    const urls = [];
    walkKeys(obj, (key, value, currentPath) => {
        if (typeof value === 'string' && /^https?:\/\//.test(value)) {
            urls.push({ url: value, keyPath: currentPath });
        }
    });
    return urls;
}

function startSpinner() {
    // Spinner setup
    const spinnerFrames = ['|', '/', '-', '\\'];
    let spinnerIndex = 0;
    let spinnerInterval;

    spinnerInterval = setInterval(() => {
        process.stdout.write(
            '\rProcessing all files: ' + spinnerFrames[spinnerIndex] + '\n\n'
        );
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
    }, 100);
}


function stopSpinner(spinnerInterval) {
    clearInterval(spinnerInterval);
    if (typeof stopSpinner.lastDuration === 'string') {
        process.stdout.write(
            `\rProcess completed ✓ (Total time: ${stopSpinner.lastDuration} seconds)\n`
        );
    } else {
        process.stdout.write('\rProcess completed ✓\n');
    }
}

function startStopSpinner(start = true) {
    if (process.env.DEBUG === 'true') {
        let spinner, startTime;
        if (start) {
            startTime = Date.now();
            spinner = startSpinner();
        } else {
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            stopSpinner.lastDuration = duration;
            stopSpinner(spinner);
        }
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function extractTags(content, tags) {
    // Returns an array of { tag, index, containerIndex }
    const regex = new RegExp(`<(${tags.join('|')})(\\s|>)`, 'gi');
    let match,
        result = [];
    let containerIndex = -1;
    while ((match = regex.exec(content)) !== null) {
        const tag = match[1].toLowerCase();
        if (tag === 'section' || tag === 'div') {
            containerIndex++;
        }
        result.push({ tag, index: match.index, containerIndex });
    }
    return result;
}

export async function batchProcess(files, batchSize, processFn) {
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await Promise.all(batch.map(processFn));
    }
}

export {
    checkIfIdExists,
    extractUrls,
    startStopSpinner,
    extractTags,
    escapeHtml,
};
