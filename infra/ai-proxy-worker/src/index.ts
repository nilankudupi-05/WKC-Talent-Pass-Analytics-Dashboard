/**
 * Cloudflare Worker: AI proxy for the WKC Talent Pass dashboard.
 *
 * Replaces the Express `api-server` /api/ai/complete route so the dashboard can
 * be hosted statically on GitHub Pages. Holds the Anthropic API key as a Worker
 * secret (never shipped to the browser) and forwards to the public Anthropic API.
 *
 * Contract (must match src/App.tsx fetchAIMapping + callClaude):
 *   POST /api/ai/complete
 *   body:     { system?: string, messages: {role,content}[], maxTokens?: number }
 *   success:  { text: string }
 *   failure:  { error: string }   (non-2xx status)
 */

interface Env {
  ANTHROPIC_API_KEY: string;
  // Optional: lock CORS to your Pages origin, e.g.
  // "https://nilankudupi-05.github.io". Defaults to "*" if unset.
  ALLOWED_ORIGIN?: string;
}

// Public Anthropic model id. The old code used "claude-sonnet-4-6", which only
// resolved through the Replit gateway — use a valid public id here.
const MODEL = "claude-sonnet-4-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface CompleteBody {
  system?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/api/ai/complete") {
      return json({ error: "Not found" }, 404, env);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500, env);
    }

    let body: CompleteBody;
    try {
      body = (await request.json()) as CompleteBody;
    } catch {
      return json({ error: "Invalid JSON body" }, 400, env);
    }

    const { system, messages, maxTokens } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages array is required" }, 400, env);
    }

    try {
      const upstream = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens ?? 2000,
          ...(system ? { system } : {}),
          messages,
        }),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        return json({ error: `Anthropic API error: ${errText}` }, 502, env);
      }

      const data = (await upstream.json()) as {
        content?: { type: string; text?: string }[];
      };
      const block = data.content?.[0];
      const text = block && block.type === "text" ? block.text ?? "" : "";
      return json({ text }, 200, env);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, 500, env);
    }
  },
};
