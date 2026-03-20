import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callModel } from './load-model.js';
import { debug } from '@bynovl/optimize-utils/debug-log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Find project root (directory containing optimize.config.js)
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
  let file = ''
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

export default async function exportReport(config, results) {

  const { llm = {} } = config;
  const { report = {} } = config;
  let fileOutput = report.fileOutput;

  // DRY: Use readFileContent for both expert and skill, with fallback
  const auditExpert = readFileContent(report.skill || 'seo-expert.md', 'seo-expert.md');
  let auditPrompt = readFileContent(report.prompt || 'seo-audit.md', 'seo-audit.md');

  // Insert date and preparer from config.report
  const now = new Date();
  const dateString = now.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const preparer = (config.report && config.report.preparer) || 'Unknown';
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
  const outputPath = resolvePath(fileOutput);
  try {
    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, reportContent, 'utf8');
    console.log('[exportReport] Successfully wrote report to:', outputPath);
  } catch (err) {
    console.error('[exportReport] Failed to write report:', err.message);
    throw err;
  }
  return outputPath;
}
