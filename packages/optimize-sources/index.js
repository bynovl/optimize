// REQUIRED IMPORTS
import fs from 'fs';
import path from 'path';
import { resolveFilePath } from '@bynovl/optimize-utils/resolve-path.js';
import { createNewItem, returnResults, updatePageTotals } from '@bynovl/optimize-lib/return.js';
import { batchProcess } from '@bynovl/optimize-utils/batch-process.js';
import { checkProps } from './scripts/check-props.js';
import { validateCheck } from './scripts/check-validation.js';
import { debug, debugPath } from '@bynovl/optimize-utils/debug-log.js';

/* Get current file path for debug logging */
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

export default async function checkSources(config, htmlFiles, startUrl) {
  const failedItems = [];
  // Debug path for check
  debugPath('SOURCES', __filename);
  const processFile = async (file) => {
    try {
      resolveFilePath(config, file);
      const content = await fs.promises.readFile(file, 'utf8');
      const relPath = path.relative(config.outDir, file);
      const item = createNewItem(relPath, checkProps.key);

      const { validatedItem, labels } = await validateCheck(item, content, config, file, startUrl);
      updatePageTotals(validatedItem, checkProps.key, labels);

      if (validatedItem[checkProps.key].results.length) {
        failedItems.push(validatedItem);
      }
    } catch (error) {
      debug(`[PROCESS FAILED]: ${error.message}`)
    }
  };
  if (htmlFiles.length < config.batchSize) {
    for (const file of htmlFiles) {
      await processFile(file);
    }
  } else {
    await batchProcess(htmlFiles, config.batchSize, processFile);
  }
  return returnResults(failedItems, checkProps.label);
}
