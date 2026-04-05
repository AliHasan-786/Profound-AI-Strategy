import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

let openaiClient = null;
let anthropicClient = null;

function getOpenAI() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropic() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

const SYSTEM_PROMPT =
  'You are a knowledgeable assistant. Answer the following question accurately and concisely in 2-4 sentences. Do not use bullet points.';

/**
 * Send a single prompt to a model and return the text response.
 * Retries once on transient errors.
 */
export async function callModel(model, promptText, retries = 1) {
  try {
    if (model === 'gpt-4o') {
      const res = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptText },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      return res.choices[0].message.content.trim();
    }

    if (model === 'claude-3-5-sonnet') {
      const res = await getAnthropic().messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: promptText }],
      });
      return res.content[0].text.trim();
    }

    throw new Error(`Unknown model: ${model}`);
  } catch (err) {
    if (retries > 0 && isTransient(err)) {
      await sleep(2000);
      return callModel(model, promptText, retries - 1);
    }
    throw err;
  }
}

function isTransient(err) {
  const msg = err?.message || '';
  return (
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('503') ||
    msg.includes('529') ||
    err?.status === 429 ||
    err?.status === 503
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
