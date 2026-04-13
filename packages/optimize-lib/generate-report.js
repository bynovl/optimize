import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { callModel } from './load-model.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: split array into chunks
function chunkArray(arr, chunkSize) {
  const out = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    out.push(arr.slice(i, i + chunkSize));
  }
  return out;
}

// Throttle utility: runs async tasks with concurrency limit
async function throttledMap(arr, limit, asyncFn) {
  const results = [];
  let idx = 0;
  let active = 0;
  return new Promise((resolve, reject) => {
    function next() {
      if (idx === arr.length && active === 0) return resolve(results);
      while (active < limit && idx < arr.length) {
        const curIdx = idx++;
        active++;
        asyncFn(arr[curIdx], curIdx)
          .then(res => { results[curIdx] = res; })
          .catch(err => { results[curIdx] = err; })
          .finally(() => { active--; next(); });
      }
    }
    next();
  });
}

// Retry utility: retries asyncFn on error with exponential backoff
async function retryAsync(asyncFn, retries = 3, delay = 1000) {
  let attempt = 0;
  while (true) {
    try {
      return await asyncFn();
    } catch (err) {
      if (attempt++ >= retries || !isTransientError(err)) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
}

function isTransientError(err) {
  const msg = (err && err.message) ? err.message.toLowerCase() : '';
  return (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('socket hang up') ||
    msg.includes('timeout')
  );
}

// Helper: recursively summarize large arrays in a section (map-reduce) with throttling, retry, and strict max prompt size
function promptSize(str) {
  return Buffer.byteLength(str, 'utf8');
}

// Use LLM config or sensible defaults
function getLLMOptions(llm = {}) {
  return {
    chunkSize: llm.chunkSize || 50,
    concurrency: llm.concurrency || 2,
    retries: llm.retries || 3,
    maxPromptSize: llm.maxPromptSize || 8000, // bytes, ~2k tokens
  };
}

async function summarizeSectionWithChunks({ section, sectionName, auditExpert, auditPrompt, llm, chunkSize, concurrency, retries, maxPromptSize, depth = 0 }) {
  // Defensive: avoid infinite recursion
  if (depth > 10) return `Error: Too many recursive reductions in ${sectionName}`;

  // Find the largest array property in the section
  let arrayKey = null;
  let arr = null;
  for (const key of Object.keys(section)) {
    if (Array.isArray(section[key]) && section[key].length > chunkSize) {
      if (!arr || section[key].length > arr.length) {
        arrayKey = key;
        arr = section[key];
      }
    }
  }

  // If there is a large array, chunk and summarize recursively
  if (arr) {
    const chunks = chunkArray(arr, chunkSize);
    const chunkSummaries = await throttledMap(
      chunks,
      concurrency,
      async (chunk, idx) => {
        const chunkSection = { ...section, [arrayKey]: chunk };
        // Recursively reduce if still too large
        let chunkPrompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify(chunkSection))}`;
        if (promptSize(chunkPrompt) > maxPromptSize) {
          // Recursively reduce this chunk
          return await summarizeSectionWithChunks({ section: chunkSection, sectionName: sectionName + ` chunk${idx}`, auditExpert, auditPrompt, llm, chunkSize: Math.max(5, Math.floor(chunkSize / 2)), concurrency, retries, maxPromptSize, depth: depth + 1 });
        }
        try {
          return await retryAsync(() => callModel({ prompt: chunkPrompt, modelOptions: llm }), retries);
        } catch (err) {
          console.error(`[exportReport] callModel error for ${sectionName} chunk ${idx}:`, err);
          return `Error summarizing ${sectionName} chunk ${idx}: ${err.message}`;
        }
      }
    );
    // Reduce summaries if needed
    let reducePrompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify({ [arrayKey + '_summaries']: chunkSummaries }))}`;
    if (promptSize(reducePrompt) > maxPromptSize) {
      // Recursively reduce summaries
      return await summarizeSectionWithChunks({ section: { [arrayKey + '_summaries']: chunkSummaries }, sectionName: sectionName + ' reduce', auditExpert, auditPrompt, llm, chunkSize: Math.max(2, Math.floor(chunkSummaries.length / 2)), concurrency, retries, maxPromptSize, depth: depth + 1 });
    }
    try {
      return await retryAsync(() => callModel({ prompt: reducePrompt, modelOptions: llm }), retries);
    } catch (err) {
      console.error(`[exportReport] callModel error for ${sectionName} reduce:`, err);
      return `Error summarizing ${sectionName} reduce: ${err.message}`;
    }
  } else {
    // No large array, but check prompt size
    const sectionPrompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify(section))}`;
    if (promptSize(sectionPrompt) > maxPromptSize) {
      // Recursively reduce by splitting object keys if possible
      if (typeof section === 'object' && section && Object.keys(section).length > 1) {
        const keys = Object.keys(section);
        const mid = Math.floor(keys.length / 2);
        const left = {};
        const right = {};
        keys.slice(0, mid).forEach(k => { left[k] = section[k]; });
        keys.slice(mid).forEach(k => { right[k] = section[k]; });
        const leftSummary = await summarizeSectionWithChunks({ section: left, sectionName: sectionName + ' (part 1)', auditExpert, auditPrompt, llm, chunkSize, concurrency, retries, maxPromptSize, depth: depth + 1 });
        const rightSummary = await summarizeSectionWithChunks({ section: right, sectionName: sectionName + ' (part 2)', auditExpert, auditPrompt, llm, chunkSize, concurrency, retries, maxPromptSize, depth: depth + 1 });
        // Reduce the two summaries
        const reducePrompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify({ left: leftSummary, right: rightSummary }))}`;
        if (promptSize(reducePrompt) > maxPromptSize) {
          // Recursively reduce again
          return await summarizeSectionWithChunks({ section: { left: leftSummary, right: rightSummary }, sectionName: sectionName + ' reduce', auditExpert, auditPrompt, llm, chunkSize, concurrency, retries, maxPromptSize, depth: depth + 1 });
        }
        try {
          return await retryAsync(() => callModel({ prompt: reducePrompt, modelOptions: llm }), retries);
        } catch (err) {
          console.error(`[exportReport] callModel error for ${sectionName} reduce:`, err);
          return `Error summarizing ${sectionName} reduce: ${err.message}`;
        }
      } else {
        return `Error: Section ${sectionName} is too large to summarize and cannot be split further.`;
      }
    }
    try {
      return await retryAsync(() => callModel({ prompt: sectionPrompt, modelOptions: llm }), retries);
    } catch (err) {
      console.error(`[exportReport] callModel error for section ${sectionName}:`, err);
      return `Error summarizing ${sectionName}: ${err.message}`;
    }
  }
}

function readFileContent(filePath, defaultFilePath) {
  let file = '';
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (fs.existsSync(absPath)) {
    file = absPath;
  } else {
    file = path.resolve(__dirname, defaultFilePath);
  }
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read file at ${filePath}: ${e.message}`);
  }
}

export default async function exportReport(config, results, reportPathOverride) {
  const startTime = Date.now();
  const { llm = {} } = config;
  const { report = {} } = config;
  let fileOutput;
  if (typeof reportPathOverride === 'string') {
    fileOutput = reportPathOverride;
  } else {
    fileOutput = report.fileOutput;
  }

  // DRY: Use readFileContent for both expert and skill, with fallback
  const auditExpert = readFileContent(report.skill || 'seo-expert.md', 'seo-expert.md');
  let auditPrompt = readFileContent(report.prompt || 'seo-audit.md', 'seo-audit.md');

  // Insert date and preparer from config.report
  const now = new Date();
  const dateString = now.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const preparer = (config.report && config.report.preparer) || 'Optimize Audit Tool';
  auditPrompt = auditPrompt.replace('[insert date]', dateString).replace('[preparer]', preparer);

  // --- Chunking logic ---
  // Thresholds (tune as needed)
  const MAX_FILE_SIZE = 12000 * 2; // ~24KB (tune for your LLM)
  const MAX_LINE_COUNT = 400; // ~400 lines (tune for your LLM)
  const resultsString = JSON.stringify(results);
  const fileSize = Buffer.byteLength(resultsString, 'utf8');
  const lineCount = resultsString.split('\n').length;

  let reportContent;
  // Use LLM config or sensible defaults
  const llmOpts = getLLMOptions(llm);
  if (llm.model && (fileSize > MAX_FILE_SIZE || lineCount > MAX_LINE_COUNT)) {
    // Robustly handle both full and focused/fallback result structures
    let sections = null;
    if (Array.isArray(results.results)) {
      // Standard: results.results is an array
      sections = results.results;
    } else if (Array.isArray(results)) {
      // Focused: results itself is an array
      sections = results;
    } else if (results && typeof results === 'object' && results.name) {
      // Focused: results is a single section object
      sections = [results];
    } else {
      throw new Error('Invalid results structure: expected results.results (array), results (array), or single section object.');
    }
    const sectionFiles = sections.map(section => {
      const sectionName = section.name || 'unknown';
      return { sectionName, section };
    });
    // Summarize each section with throttling and retry
    const summaries = await throttledMap(
      sectionFiles,
      llmOpts.concurrency,
      async ({ sectionName, section }) =>
        summarizeSectionWithChunks({
          section,
          sectionName,
          auditExpert,
          auditPrompt,
          llm,
          chunkSize: llmOpts.chunkSize,
          concurrency: llmOpts.concurrency,
          retries: llmOpts.retries,
          maxPromptSize: llmOpts.maxPromptSize
        })
    );

    // Compose a single prompt for the LLM to generate a unified report
    const unifiedPrompt = `# Project Review\n${auditExpert}\n\nYou are an expert web auditor. Given the following section summaries, generate a single, cohesive audit report with:\n- One executive summary\n- A section-by-section breakdown\n- Actionable recommendations\n- A single conclusion\n\nSection Summaries:\n${sectionFiles.map((f, i) => `=== ${f.sectionName} ===\n${summaries[i]}`).join('\n')}\n`;
    try {
      reportContent = await retryAsync(() => callModel({ prompt: unifiedPrompt, modelOptions: llm }), llmOpts.retries);
    } catch (err) {
      console.error('[exportReport] callModel error (unified report):', err);
      reportContent = `Error generating unified report: ${err.message}\n\nSection Summaries:\n${sectionFiles.map((f, i) => `=== ${f.sectionName} ===\n${summaries[i]}`).join('\n')}`;
    }
  } else {
    // Single prompt (current behavior)
    const prompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify(results))}`;
    if (llm.model) {
      try {
        reportContent = await callModel({ prompt, modelOptions: llm });
      } catch (err) {
        console.error('[exportReport] callModel error:', err);
        throw err;
      }
    } else {
      reportContent = prompt;
    }
  }

  if (!fileOutput) {
    fileOutput = 'report.md';
    debug('[exportReport] No fileOutput specified, defaulting to report.md at project root');
  }
  // Always resolve output path relative to the actual project root (process.cwd())
  const outputPath = path.isAbsolute(fileOutput)
    ? fileOutput
    : path.join(process.cwd(), fileOutput);
  console.log(outputPath);

  try {
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, reportContent, 'utf8');
  } catch (err) {
    console.error('[exportReport] Failed to write report:', err.message);
    throw err;
  }
  const endTime = Date.now();
  const durationSec = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`[exportReport] Report generated in ${durationSec} seconds.`);
  return outputPath;
}
