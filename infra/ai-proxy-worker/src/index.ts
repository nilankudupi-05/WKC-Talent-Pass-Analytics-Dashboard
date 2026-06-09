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
  // Optional CORS allowlist. Comma-separated list of allowed origins, e.g.
  // "https://talentpassanalytics.netlify.app,https://nilankudupi-05.github.io".
  // The Worker echoes back whichever listed origin made the request. Defaults
  // to "*" (any origin) when unset.
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

// Resolve the Access-Control-Allow-Origin value for this request.
// ALLOWED_ORIGIN is a comma-separated allowlist; if the request's Origin is in
// it, echo that origin back (so multiple front-ends — Netlify + GitHub Pages —
// can each be granted). If ALLOWED_ORIGIN is unset, allow any origin ("*").
function resolveAllowOrigin(request: Request, env: Env): string {
  const allowed = (env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0) return "*";
  const origin = request.headers.get("Origin") || "";
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0];
}

function corsHeaders(allowOrigin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    // Responses vary by request Origin, so caches must key on it.
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, allowOrigin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(allowOrigin) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowOrigin = resolveAllowOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(allowOrigin) });
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/api/ai/complete") {
      return json({ error: "Not found" }, 404, allowOrigin);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY is not configured" }, 500, allowOrigin);
    }

    let body: CompleteBody;
    try {
      body = (await request.json()) as CompleteBody;
    } catch {
      return json({ error: "Invalid JSON body" }, 400, allowOrigin);
    }

    const { system, messages, maxTokens } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages array is required" }, 400, allowOrigin);
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
        return json({ error: `Anthropic API error: ${errText}` }, 502, allowOrigin);
      }

      const data = (await upstream.json()) as {
        content?: { type: string; text?: string }[];
      };
      const block = data.content?.[0];
      const text = block && block.type === "text" ? block.text ?? "" : "";
      return json({ text }, 200, allowOrigin);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, 500, allowOrigin);
    }
  },
};
