// Cloudflare crawl implementation using their Browser Rendering API
import { colors } from './ansi-colors.js';
import { consoleLog } from './debug-log.js';

async function cloudflareCrawlUrl(targetUrl, crawlConfig) {
  const apiToken =  process.env.CRAWL_API_TOKEN || crawlConfig.apiToken;
  const accountId = process.env.CRAWL_ACCOUNT_ID || crawlConfig.accountId;
  const options = crawlConfig.options || {};
  if (!apiToken) {
    throw new Error('Cloudflare API Token is not defined. Add a CRAWL_API_TOKEN variable or apiToken in the config');
  }
  if (!accountId) {d
    throw new Error('Cloudflare Acount ID is note defined. Add CRAWL_ACCOUNT_ID variable or accountId in the config.');
  }
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl`;
  const body = {
    url: targetUrl,
    limit: options.limit || 15,
    depth: options.depth || 3,
    source: options.source || 'all',
    render: options.render || false,
    // Add more options as needed
  };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare API error: ${response.status} ${error}`);
  }
  const data = await response.json();
  return data.result || (data.result && data.result.id);
}

async function cloudflareWaitForCrawlCompletion(jobId, crawlConfig) {
  const apiToken = crawlConfig.apiToken;
  const accountId = crawlConfig.accountId;
  const pollInterval = (crawlConfig.options && crawlConfig.options.pollInterval) || 5000;
  const maxAttempts = (crawlConfig.options && crawlConfig.options.maxAttempts) || 60;
  for (let i = 0; i < maxAttempts; i++) {
    let url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl/${jobId}?limit=1`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} ${error}`);
    }
    const result = await response.json();
    if (result.result && result.result.status && result.result.status !== 'running') {
      return result.result;
    }
    await new Promise(res => setTimeout(res, pollInterval));
  }
  throw new Error('Crawl job did not complete within timeout');
}

async function cloudflareGetCrawlResultsPaginated(jobId, crawlConfig, {
  status = 'completed',
  limit: pageLimit,
} = {}) {
  const apiToken = crawlConfig.apiToken;
  const accountId = crawlConfig.accountId;
  const options = crawlConfig.options || {};
  let allRecords = [];
  let cursor = undefined;
  const limitToUse = pageLimit || options.limit || 15;
  while (true) {
    let url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl/${jobId}?status=${status}&limit=${limitToUse}`;
    if (cursor !== undefined) url += `&cursor=${cursor}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} ${error}`);
    }
    const data = await response.json();
    if (data.result && Array.isArray(data.result.records)) {
      allRecords.push(...data.result.records);
    }
    if (data.result && data.result.cursor !== undefined) {
      cursor = data.result.cursor;
    } else {
      break;
    }
  }
  return allRecords;
}

// Main Cloudflare crawl orchestrator
export async function crawlCloudflare(siteUrl, config, outputDir = 'crawl_output', configPath = './optimize.config.js') {
  const crawlConfig = config.crawl;
  // Print crawl analysis header
  console.log(colors.boldGray('===========================================\nCRAWL ANALYSIS\n===========================================\n'));
  const startTime = new Date();
  const urlObj = new URL(siteUrl);
  consoleLog(colors.cyan(`🌐 Starting Crawl: ${urlObj.hostname}`), crawlConfig);
  const jobId = await cloudflareCrawlUrl(siteUrl, crawlConfig);
  if (!jobId) {
    throw new Error('No crawl job ID returned from Cloudflare.');
  }
  consoleLog(colors.cyan(`[Cloudflare] Crawl job started. Job ID: ${jobId}\n`), crawlConfig);
  consoleLog(colors.gray('[Cloudflare] Waiting for crawl job to complete...\n'), crawlConfig);
  const crawlResult = await cloudflareWaitForCrawlCompletion(jobId, crawlConfig);
  if (!crawlResult || crawlResult.status !== 'completed') {
    throw new Error('Crawl job did not complete successfully.');
  }
  const stopTime = new Date();
  consoleLog(colors.brightGreen(`[Cloudflare] Crawl completed. Downloading all completed pages to ${outputDir} ...\n`), crawlConfig);
  // Fetch all completed records (no limit param)
  const allRecords = await cloudflareGetCrawlResultsPaginated(jobId, crawlConfig, { status: 'completed' });
  if (!allRecords.length) {
    throw new Error('No completed records found in crawl result.');
  }
  const duration = (stopTime - startTime) / 1000;
  // Return only allRecords for use by caller
  return { allRecords, duration };
}
