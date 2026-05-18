import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

router.post("/ai/complete", async (req, res) => {
  const { system, messages, maxTokens } = req.body as {
    system?: string;
    messages: { role: "user" | "assistant"; content: string }[];
    maxTokens?: number;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens ?? 2000,
      ...(system ? { system } : {}),
      messages,
    });

    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    res.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI complete error");
    res.status(500).json({ error: message });
  }
});

export default router;
