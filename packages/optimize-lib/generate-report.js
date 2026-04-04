import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callModel } from './load-model.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Only pass the actual audit results, never the config or llm object
  let safeResults = results;
  if (results && typeof results === 'object') {
    const { llm, ...rest } = results;
    safeResults = rest;
  }

  // Prepare the prompt for the AI model
  const prompt = `# Project Review\n${auditExpert}\n\n${auditPrompt.replace('{results}', JSON.stringify(results))}`;

  let reportContent;
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
  return outputPath;
}
