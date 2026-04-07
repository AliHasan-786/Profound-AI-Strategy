import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'no-key',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'https://aeo-studio.vercel.app',
    'X-Title': 'AEO Studio',
  },
});

const MODELS = {
  'gpt-4o':             'openai/gpt-4o-mini',
  'claude-3-5-sonnet':  'anthropic/claude-3-haiku',
  'perplexity':         'perplexity/llama-3.1-sonar-large-128k-online',
};

const SYSTEM_PROMPT =
  'You are a knowledgeable assistant. Answer the following question accurately and concisely in 2-4 sentences. Do not use bullet points.';

export async function callModel(model, promptText, retries = 1) {
  const modelId = MODELS[model] || MODELS['gpt-4o'];
  try {
    const res = await openrouter.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptText },
      ],
      max_tokens: 400,
      temperature: 0,
    });
    return res.choices[0].message.content.trim();
  } catch (err) {
    if (retries > 0 && isTransient(err)) {
      await sleep(2000);
      return callModel(model, promptText, retries - 1);
    }
    throw err;
  }
}

export async function callModelWithCitations(model, promptText, retries = 1) {
  const modelId = MODELS[model] || MODELS['gpt-4o'];
  try {
    const res = await openrouter.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptText },
      ],
      max_tokens: 400,
      temperature: 0,
    });
    const content = res.choices[0].message.content.trim();
    // OpenRouter passes through Perplexity's citations array
    // It may appear as res.citations or nested differently
    const citations = res.citations ||
                      res.choices[0]?.delta?.citations ||
                      [];
    return { content, citations: Array.isArray(citations) ? citations : [] };
  } catch (err) {
    if (retries > 0 && isTransient(err)) {
      await sleep(2000);
      return callModelWithCitations(model, promptText, retries - 1);
    }
    throw err;
  }
}

function isTransient(err) {
  const msg = err?.message || '';
  return msg.includes('rate limit') || msg.includes('timeout') || err?.status === 429 || err?.status === 503;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
