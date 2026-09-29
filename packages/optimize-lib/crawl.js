
import { crawlWithProvider, getUniqueCrawlOutputDir, simpleCrawl } from '@bynovl/optimize-utils/crawl-utils.js';
import { updateUserConfig } from './load-config.js';
/**
 * Crawl a site and save HTML files to outputDir.
 * config - The config object.
 * siteUrl - The URL to crawl.
 * [outputDir] - Directory to save HTML files (default: 'crawl_output')
 */

export async function crawlSite(config, siteUrl, outputDir = null) {
  // If outputDir is not provided, generate a unique one
  const baseDir = process.cwd();
  const outDir = outputDir || getUniqueCrawlOutputDir(baseDir, 'crawl_output');

  if (!config.crawl || !config.crawl.provider) {
    await simpleCrawl(siteUrl, config, outDir);
  } else {
    // Start crawl with provider (Cloudflare or others in the future)
    await crawlWithProvider(siteUrl, config, outDir);
  }

  // Set current run startUrl and outDir 
  config.startUrl = siteUrl;
  config.outDir = outDir;

  // Update or create an optimize.config.js with new startUrl and outDir for future runs
  // ------------
  // The trade off with this is using an AST but adds unnecessary bloat for the convenience of a config update
  updateUserConfig(siteUrl, outDir);
}
