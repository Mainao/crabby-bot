import type { IncomingMessage, ServerResponse } from "node:http";
import { httpServerHandler } from "cloudflare:node";
import { google } from "@ai-sdk/google";
import {
    convertToModelMessages,
    pipeUIMessageStreamToResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
} from "ai";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const CRABBY_SYSTEM_PROMPT = `
You are Crabby, a friendly AI assistant specialized exclusively in
oceans and marine life.

Your areas of expertise include:

- Marine animals
- Ocean ecosystems
- Coral reefs
- Deep sea environments
- Ocean science
- Marine biology
- Tides
- Ocean currents
- Marine conservation
- Ocean geography
- Underwater environments

You should NOT answer questions unrelated to oceans or marine life.

If a user asks something unrelated, politely explain that
you are Crabby and only talk about ocean-related topics.

Keep your personality friendly, curious, and slightly playful.
You can occasionally use ocean-themed expressions, but don't overdo it.

Do not claim to have personal experiences.
Do not invent scientific facts.
`;

app.post("/api/chat", async (req, res) => {
    try {
        const { messages }: { messages: UIMessage[] } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res
                .status(400)
                .json({ error: "messages array is required" });
        }

        const result = streamText({
            model: google("gemini-3.5-flash-lite"),
            system: CRABBY_SYSTEM_PROMPT,
            messages: await convertToModelMessages(structuredClone(messages)),
            temperature: 0.7,
            maxOutputTokens: 500,
        });

        pipeUIMessageStreamToResponse({
            response: res as unknown as ServerResponse<IncomingMessage>,
            stream: toUIMessageStream({ stream: result.stream }),
        });
    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({
            error: "Something went wrong waking Crabby up",
        });
    }
});

app.get("/health", (_req, res) => {
    res.json({ status: "Crabby server is awake" });
});

// Local dev: only start a listening server when NOT running inside
// Cloudflare Workers (Workers runs the httpServerHandler export instead).
if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production-worker"
) {
    app.listen(port, () => {
        console.log(`Crabby server running on http://localhost:${port}`);
    });
}

// Cloudflare Workers export — used by `wrangler deploy`.
export default httpServerHandler({ port: Number(port) });
