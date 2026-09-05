import type { IncomingMessage, ServerResponse } from "node:http";
import { google } from "@ai-sdk/google";
import {
    APICallError,
    convertToModelMessages,
    pipeUIMessageStreamToResponse,
    streamText,
    type TextStreamPart,
    toUIMessageStream,
    type ToolSet,
    type UIMessage,
} from "ai";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

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

const LOCATION_ERROR_RETRY_ATTEMPTS = 3;

function isLocationUnsupportedError(error: unknown): boolean {
    return (
        APICallError.isInstance(error) &&
        error.message.includes("User location is not supported")
    );
}

const PEEK_THROUGH_CHUNK_TYPES = new Set(["start", "start-step"]);

async function streamChatWithLocationRetry(
    options: Parameters<typeof streamText>[0],
): Promise<ReadableStream<TextStreamPart<ToolSet>>> {
    let attempt = 0;
    while (true) {
        attempt++;
        const result = streamText(options);
        const reader = result.stream.getReader();

        const buffered: TextStreamPart<ToolSet>[] = [];
        let settled: TextStreamPart<ToolSet> | undefined;
        let streamEnded = false;
        while (true) {
            const next = await reader.read();
            if (next.done) {
                streamEnded = true;
                break;
            }
            if (PEEK_THROUGH_CHUNK_TYPES.has(next.value.type)) {
                buffered.push(next.value);
                continue;
            }
            settled = next.value;
            buffered.push(next.value);
            break;
        }

        if (
            settled?.type === "error" &&
            isLocationUnsupportedError(settled.error)
        ) {
            reader.cancel().catch(() => {});
            if (attempt < LOCATION_ERROR_RETRY_ATTEMPTS) {
                console.warn(
                    `[chat] Gemini location error on attempt ${attempt}/${LOCATION_ERROR_RETRY_ATTEMPTS} — retrying...`,
                );
                continue;
            }
            console.warn(
                `[chat] Gemini location error on attempt ${attempt}/${LOCATION_ERROR_RETRY_ATTEMPTS} — giving up.`,
            );
            throw settled.error;
        }

        return new ReadableStream({
            start(controller) {
                for (const chunk of buffered) controller.enqueue(chunk);
                if (streamEnded) controller.close();
            },
            async pull(controller) {
                const { done, value } = await reader.read();
                if (done) {
                    controller.close();
                    return;
                }
                controller.enqueue(value);
            },
            cancel(reason) {
                reader.cancel(reason).catch(() => {});
            },
        });
    }
}

const cloudflareWorkers = await import("cloudflare:workers").catch(() => null);

app.post("/api/chat", async (req, res) => {
    try {
        const rateLimiter = cloudflareWorkers?.env?.RATE_LIMITER;
        if (rateLimiter) {
            const forwardedIp = req.headers["cf-connecting-ip"];
            const ip = Array.isArray(forwardedIp)
                ? forwardedIp[0]
                : forwardedIp;
            try {
                const { success } = await rateLimiter.limit({
                    key: ip ?? "unknown",
                });
                if (!success) {
                    return res.status(429).json({
                        error: "Crabby needs a breather — too many questions at once! Try again in a moment.",
                    });
                }
            } catch (limitErr) {
                throw limitErr;
            }
        }

        const { messages }: { messages: UIMessage[] } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res
                .status(400)
                .json({ error: "messages array is required" });
        }

        const stream = await streamChatWithLocationRetry({
            model: google("gemini-3.5-flash-lite"),
            system: CRABBY_SYSTEM_PROMPT,
            messages: await convertToModelMessages(structuredClone(messages)),
            temperature: 0.7,
            maxOutputTokens: 500,
        });

        pipeUIMessageStreamToResponse({
            response: res as unknown as ServerResponse<IncomingMessage>,
            stream: toUIMessageStream({ stream }),
        });
    } catch (err) {
        if (isLocationUnsupportedError(err)) {
            console.error(
                "Chat error: Gemini location error, retries exhausted:",
                err,
            );
            return res.status(503).json({
                error: "Crabby drifted into choppy waters and couldn't connect. Please try again in a moment! 🌊",
            });
        }
        console.error("Chat error:", err);
        res.status(500).json({
            error: "Something went wrong waking Crabby up",
        });
    }
});

app.get("/health", (_req, res) => {
    res.json({ status: "Crabby server is awake" });
});

export default app;
