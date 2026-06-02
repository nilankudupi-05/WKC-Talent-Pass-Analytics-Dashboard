import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

if (!apiKey) {
  throw new Error(
    "ANTHROPIC_API_KEY must be set.",
  );
}

export const anthropic = new Anthropic({
  apiKey,
  ...(baseURL && !process.env.ANTHROPIC_API_KEY ? { baseURL } : {}),
});
