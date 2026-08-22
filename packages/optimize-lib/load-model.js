import https from 'https';

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* Supports Open AI and Hugging Face compatible models 
----------------------------------------
/v1/chat/completions (OpenAI)
/v1/messages (Anthropic)
----------------------------------------
models.github.ai/inference/v1/chat/completions (GitHub)
Hugging Face: full endpoint URL required as model
----------------------------------------
*/
function validateProvider(provider, model, modelOptions, key) {
  const requirements = {
    openai: () => {
      if (!key) throw new Error('OpenAI: API key required (set process.env.MODEL_KEY or llm.key)');
      if (!modelOptions?.model) throw new Error('OpenAI: model name required in llm.model');
    },
    anthropic: () => {
      if (!key) throw new Error('Anthropic: API key required (set process.env.MODEL_KEY or llm.key)');
      if (!modelOptions?.model) throw new Error('Anthropic: model name required in llm.model');
    },
    claude: () => {
      if (!key) throw new Error('Anthropic: API key required (set process.env.MODEL_KEY or llm.key)');
      if (!modelOptions?.model) throw new Error('Anthropic: model name required in llm.model');
    },
    huggingface: () => {
      if (!model) throw new Error('HuggingFace: endpoint URL required as model');
    },
    hf: () => {
      if (!model) throw new Error('HuggingFace: endpoint URL required as model');
    }
  };
  if (model && typeof model === 'string' && requirements[provider]) {
    requirements[provider]();
  }
}

async function callModel({ prompt, modelOptions }) {
  let provider = modelOptions?.provider || '';
  const model = modelOptions?.model;
  const key = modelOptions?.key || process.env.MODEL_KEY;
  const urlOverride = modelOptions?.url;
  provider = provider.toLowerCase();
  validateProvider(provider, model, modelOptions, key);

  if (typeof model === 'function') {
    return await model({ prompt, apiKey: key, ...modelOptions });
  }
  if (typeof model !== 'string') {
    throw new Error('Invalid model option: must be a function or endpoint URL string');
  }

  let options, requestBody;
  if (provider === 'github') {
    // GitHub Models: fixed hostname/path
    const hostname = 'models.github.ai';
    requestBody = JSON.stringify({
      model: modelOptions.model || model,
      messages: [
        { role: 'system', content: modelOptions.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      ...modelOptions.extra
    });
    options = {
      protocol: 'https:',
      hostname,
      path: '/inference/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
  } else if (provider === 'anthropic' || provider === 'claude') {
    // Anthropic: fixed hostname/path
    const hostname = 'api.anthropic.com';
    requestBody = JSON.stringify({
      model: modelOptions.model,
      max_tokens: modelOptions.max_tokens || 1024,
      system: modelOptions.systemPrompt || '',
      messages: [{ role: 'user', content: prompt }],
      ...modelOptions.extra
    });
    options = {
      protocol: 'https:',
      hostname,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': modelOptions.anthropicVersion || '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
  } else if (provider === 'openai') {
    // OpenAI: fixed hostname/path
    const hostname = 'api.openai.com';
    requestBody = JSON.stringify({
      model: modelOptions.model,
      max_tokens: modelOptions.max_tokens || 4096,
      messages: [
        { role: 'system', content: modelOptions.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      ...modelOptions.extra
    });
    options = {
      protocol: 'https:',
      hostname,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
  } else if (provider === 'huggingface' || provider === 'hf') {
    // For HuggingFace, model must be a full endpoint URL
    const url = new URL(model);
    requestBody = JSON.stringify({
      inputs: prompt,
      ...modelOptions.extra
    });
    options = {
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'Authorization': `Bearer ${key}` } : {}),
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
  } else if (urlOverride) {
    // Custom Open AI compatible provider: use urlOverride
    const url = new URL(urlOverride);

    // OpenAI: fixed hostname/path
    const hostname = url.hostname;
    requestBody = JSON.stringify({
      model: modelOptions.model,
      max_tokens: modelOptions.max_tokens || 4096,
      messages: [
        { role: 'system', content: modelOptions.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      ...modelOptions.extra
    });
    options = {
      protocol: 'https:',
      hostname,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };
  } else {
    // Generic fallback
    throw new Error(`Unknown LLM provider '${provider}' and no urlOverride provided.`);
  }

  const { status, body } = await httpsPost(options, requestBody);
  let json;
  try {
    json = JSON.parse(body);
  } catch (e) {
    throw new Error(`Invalid JSON response from LLM: ${body.slice(0, 200)}`);
  }

  if (status !== 200) {
    throw new Error(json.error?.message || `LLM API error ${status}`);
  }

  if (provider === 'anthropic' || provider === 'claude') {
    return json.content?.[0]?.text;
  }
  // works for openai, github, huggingface, and generic
  return json.choices?.[0]?.message?.content || json.choices?.[0]?.text || json.generated_text || json.markdown || json.text || JSON.stringify(json);
}

export { callModel };
