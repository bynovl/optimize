export async function batchProcess(files, batchSize, processFn) {
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await Promise.all(batch.map(processFn));
    }
}