import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callModel } from './load-model.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot() {
  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'optimize.config.js'))) {
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return dir;
}
const projectRoot = findProjectRoot();

function resolvePath(p) {
  if (path.isAbsolute(p)) return p;
  return path.resolve(projectRoot, p);
}

function readFileContent(filePath, defaultFilePath) {
  let file = '';
  if (fs.existsSync(resolvePath(filePath))) {
    file = resolvePath(filePath);
  } else {
    file = path.resolve(__dirname, defaultFilePath);
  }
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read file at ${filePath}: ${e.message}`);
  }
}

// Helper to fill template variables
function fillTemplate(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
  }
  return out;
}
// Summarize a single category chunk (findings, recommendations, details only)
async function summarizeChunk({
  chunkName,
  chunkData,
  chunkTemplate,
  llm
}) {
  // Explicitly instruct the LLM to audit the results
  const prompt = `You are an expert web auditor. Analyze the following JSON audit results for the category "${chunkName}". Provide:
  - A concise summary of the most important findings
  - Actionable recommendations prioritized by severity
  - Any relevant details, tables, or code samples

JSON results:
${JSON.stringify(chunkData, null, 2)}

Format your response as markdown under the headings: ### Findings, ### Recommendations, ### Details.`;
  if (llm && llm.model) {
    let retries = 0;
    const maxRetries = typeof llm.maxRetries === 'number' ? llm.maxRetries : 0;
    const delayMs = (typeof llm.delay === 'number' ? llm.delay : 15) * 1000;
    while (true) {
      try {
        return await callModel({ prompt, modelOptions: llm });
      } catch (err) {
        debug(`[summarizeChunk] callModel error: ${err}`);
        // Only retry on rate-limit errors and if allowed
        const isRateLimit = /too many requests|rate limit/i.test(err.message || '');
        if (isRateLimit && retries < maxRetries) {
          retries++;
          debug(`[summarizeChunk] Rate limit hit, waiting ${delayMs / 1000}s before retry #${retries}...`);
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }
        // Fallback: minimal summary
        return `### Findings\n- Unable to summarize due to LLM error: ${err.message || err}\n\n### Recommendations\n- Review the raw results for this category manually.\n\n### Details\n- No details available.`;
      }
    }
  } else {
    return prompt;
  }
}

// Main export function
export default async function exportReportChunked(config, results) {
  const { llm = {} } = config;
  const { report = {} } = config;
  let fileOutput = report.fileOutput;

  // Use the new template for structure
  const templatePath = report.prompt || 'seo-audit-template.md';
  let auditTemplate;
  try {
    auditTemplate = readFileContent(templatePath, 'seo-audit-template.md');
  } catch (e) {
    console.error(`[exportReportChunked] Failed to read template: ${e.message}`);
        // Fallback: minimal summary
        return `### Findings\n- Unable to summarize due to LLM error: ${err.message || err}\n\n### Recommendations\n- Review the raw results for this category manually.\n\n### Details\n- No details available.`;
  }

  // Timing: start
  const startTime = new Date();
  const startTimeString = startTime.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Debug: print incoming results
  console.log('[exportReportChunked] Incoming results object:', JSON.stringify(results, null, 2));

  // Estimate total time based on number of chunks and LLM speed
  const categories = Array.isArray(results.results) ? results.results : [];
  const numChunks = categories.length;
  // Debug: print categories
  console.log('[exportReportChunked] Categories:', categories.map(c => c && c.name));
  const AVG_CHUNK_TIME = 8; // seconds per chunk (tune as needed)
  const EXEC_SUMMARY_TIME = 15; // seconds for executive summary
  const estimatedSeconds = Math.max(5, numChunks * AVG_CHUNK_TIME + EXEC_SUMMARY_TIME);
  const estimatedTime = `${estimatedSeconds} seconds`;

  // Console log timing and size info immediately
  console.log('[exportReportChunked] Report generation started.');
  console.log(`[exportReportChunked] Start time: ${startTimeString}`);
  console.log(`[exportReportChunked] Number of categories: ${numChunks}`);
  console.log(`[exportReportChunked] Estimated time: ${estimatedTime}`);

  const preparer = (config.report && config.report.preparer) || 'Unknown';

  // The chunkTemplate is no longer used for LLM prompt, but kept for template compatibility
  let chunkTemplate = '';
  try {
    const chunkTemplateMatch = auditTemplate.match(/## \[Category Name\][\s\S]*?(?=^## |^# |\n# |$)/m);
    chunkTemplate = chunkTemplateMatch ? chunkTemplateMatch[0] : '## [Category Name]\n\n### Findings\n- ...\n\n### Recommendations\n- ...\n\n### Details\n...';
  } catch (e) {
    console.error(`[exportReportChunked] Failed to extract chunk template: ${e.message}`);
    chunkTemplate = '## [Category Name]\n\n### Findings\n- ...\n\n### Recommendations\n- ...\n\n### Details\n...';
  }

  // Chunk results by category
  const chunkSummaries = [];
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Use config.llm.delay if set, otherwise default to 15 seconds
  const chunkDelay = (llm && typeof llm.delay === 'number' ? llm.delay : 15) * 1000;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const chunkName = cat.name || 'Unknown Category';
    const chunkData = cat;
    let summary = '';
    // Debug: print prompt for this chunk
    const chunkPrompt = fillTemplate(chunkTemplate, {
      'Category Name': chunkName,
      'results': JSON.stringify(chunkData)
    });
    console.log(`[exportReportChunked] LLM prompt for category '${chunkName}':\n`, chunkPrompt.slice(0, 1000), chunkPrompt.length > 1000 ? '\n...[truncated]...' : '');
    try {
      summary = await summarizeChunk({
        chunkName,
        chunkData,
        chunkTemplate,
        llm
      });
      // Debug: print LLM response for this chunk
      console.log(`[exportReportChunked] LLM response for category '${chunkName}':\n`, summary.slice(0, 1000), summary.length > 1000 ? '\n...[truncated]...' : '');
    } catch (e) {
      console.error(`[exportReportChunked] Error summarizing chunk '${chunkName}': ${e.message}`);
      summary = `### Findings\n- Unable to summarize due to error: ${e.message || e}\n\n### Recommendations\n- Review the raw results for this category manually.\n\n### Details\n- No details available.`;
    }
    chunkSummaries.push(`## ${chunkName}\n${summary}`);
    // Pause between each chunk to avoid rate limits
    if (categories.length > 1 && i < categories.length - 1) {
      console.log(`[exportReportChunked] Waiting ${chunkDelay / 1000} seconds before next chunk to avoid rate limits...`);
      await sleep(chunkDelay);
    }
  }
  // Debug: print all chunk summaries
  console.log('[exportReportChunked] All chunkSummaries:', chunkSummaries.map(s => s.slice(0, 200)));

  // Generate a single executive summary
  let executiveSummary = '';
  if (llm && llm.model) {
    const summaryPrompt = `Summarize the following category reports for a project audit.\n\n${chunkSummaries.join('\n\n')}`;
    // Debug: print executive summary prompt
    console.log('[exportReportChunked] LLM prompt for executive summary:\n', summaryPrompt.slice(0, 1000), summaryPrompt.length > 1000 ? '\n...[truncated]...' : '');
    try {
      executiveSummary = await callModel({ prompt: summaryPrompt, modelOptions: llm });
      // Debug: print LLM response for executive summary
      console.log('[exportReportChunked] LLM response for executive summary:\n', executiveSummary.slice(0, 1000), executiveSummary.length > 1000 ? '\n...[truncated]...' : '');
    } catch (err) {
      debug(`[exportReportChunked] Executive summary error: ${err}`);
      executiveSummary = 'Error generating executive summary.';
    }
  }

  // Pause 15 seconds between each chunk to avoid rate limits
  if (categories.length > 1) {
    console.log(`[exportReportChunked] Waiting 15 seconds before next chunk to avoid rate limits...`);
    await sleep(15000);
  }
  
  // Timing: end
  const endTime = new Date();
  const endTimeString = endTime.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const actualSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const actualTime = `${actualSeconds} seconds`;

  // Fill the main template
  let reportContent = auditTemplate;
  try {
    reportContent = fillTemplate(reportContent, {
      'insert date': startTimeString,
      'preparer': preparer,
      'startTime': startTimeString,
      'endTime': endTimeString,
      'estimatedTime': estimatedTime,
      'actualTime': actualTime,
      'Executive Summary': executiveSummary || 'Executive summary not available.',
      'Audit Findings by Category': chunkSummaries.join('\n\n'),
    });
  } catch (e) {
    console.error(`[exportReportChunked] Error filling template: ${e.message}`);
    throw e;
  }

  if (!fileOutput) {
    fileOutput = 'audit.md';
    debug('[exportReportChunked] No fileOutput specified, defaulting to audit.md at project root');
  }
  const outputPath = resolvePath(fileOutput);
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, reportContent, 'utf8');
    console.log('[exportReportChunked] Successfully wrote report to:', outputPath);
    console.log(`[exportReportChunked] End time: ${endTimeString}`);
    console.log(`[exportReportChunked] Estimated time: ${estimatedTime}, Actual time: ${actualTime}`);
  } catch (err) {
    console.error('[exportReportChunked] Failed to write report:', err.message);
    throw err;
  }
  return outputPath;
}

// ---
// Refactor plan:
// 1. Chunk results by category (e.g., Accessibility, Meta, etc.)
// 2. Summarize each chunk separately (summarizeChunk)
// 3. Optionally, generate an executive summary from all chunk summaries
// 4. Assemble and write the final report
// 5. All prompts are kept within context window limits
// ---
