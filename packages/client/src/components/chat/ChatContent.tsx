import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Check, Copy, RotateCcw, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";

const SUGGESTED_QUESTIONS = [
    "Why is the ocean blue?",
    "How do sharks hunt?",
    "What's bioluminescence?",
];

export default function ChatContent() {
    const [input, setInput] = useState("");
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(
        null,
    );
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const { messages, sendMessage, status, stop, error, regenerate } = useChat({
        transport: new DefaultChatTransport({
            api: `${import.meta.env.VITE_API_BASE_URL}/api/chat`,
        }),
    });

    const isGenerating = status === "submitted" || status === "streaming";

    useEffect(() => {
        const viewport = scrollAreaRef.current;
        if (!viewport) return;
        const id = requestAnimationFrame(() => {
            viewport.scrollTop = viewport.scrollHeight;
        });
        return () => cancelAnimationFrame(id);
    }, [messages]);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ text: input });
        setInput("");
    };

    const handleCopy = async (messageId: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => {
                setCopiedMessageId((current) =>
                    current === messageId ? null : current,
                );
            }, 1500);
        } catch {
            // clipboard access unavailable/denied; nothing to do
        }
    };

    return (
        <>
            <div className="flex-1 overflow-hidden">
                <ScrollArea
                    viewportRef={scrollAreaRef}
                    className="h-full p-3 pt-8"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-muted">
                                Hey, I'm Crabby. I live in this reef and I know
                                my ocean stuff. Curious why the ocean's blue, or
                                how a jellyfish stings without a brain? Ask
                                away.
                            </p>
                            <div className="flex flex-col gap-2">
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => sendMessage({ text: q })}
                                        className="suggestion-pill self-start px-4 py-2 rounded-full border border-accent text-accent text-sm bg-white cursor-pointer"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-5 mt-3">
                        {messages.map((m, i) => {
                            const isLastMessage = i === messages.length - 1;
                            const isLastAssistantMessage =
                                m.role === "assistant" && isLastMessage;
                            // Covers: user clicked "stop" before any content
                            // streamed in, so no assistant message exists yet
                            // to hang a regenerate button off of. Not shown
                            // when `error` is set - the error block below
                            // owns the retry affordance in that case.
                            const isLastUserMessageAwaitingRetry =
                                m.role === "user" &&
                                isLastMessage &&
                                !isGenerating &&
                                !error;
                            const messageText = m.parts
                                .map((part) =>
                                    part.type === "text" ? part.text : "",
                                )
                                .join("");

                            return (
                                <div
                                    key={m.id}
                                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                                >
                                    <div
                                        className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                                            m.role === "user"
                                                ? "max-w-[80%] bg-user-msg text-white rounded-br-sm"
                                                : "w-full bg-white text-primary rounded-bl-sm"
                                        }`}
                                    >
                                        <ReactMarkdown>
                                            {messageText}
                                        </ReactMarkdown>
                                    </div>
                                    {isLastAssistantMessage &&
                                        !isGenerating && (
                                            <div className="flex items-center gap-1 mt-1 ml-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCopy(
                                                            m.id,
                                                            messageText,
                                                        )
                                                    }
                                                    title={
                                                        copiedMessageId ===
                                                        m.id
                                                            ? "Copied!"
                                                            : "Copy response"
                                                    }
                                                    aria-label={
                                                        copiedMessageId ===
                                                        m.id
                                                            ? "Copied"
                                                            : "Copy response"
                                                    }
                                                    className="copy-button w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                                                >
                                                    {copiedMessageId ===
                                                    m.id ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        regenerate()
                                                    }
                                                    title="Regenerate response"
                                                    aria-label="Regenerate response"
                                                    className="regenerate-button w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            </div>
                                        )}
                                    {isLastUserMessageAwaitingRetry && (
                                        <button
                                            type="button"
                                            onClick={() => regenerate()}
                                            title="Retry"
                                            aria-label="Retry"
                                            className="regenerate-button mt-1 w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {isGenerating && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="flex flex-col items-start">
                                <div className="text-red-700 px-4 py-2 rounded-2xl text-sm max-w-[80%]">
                                    Crabby's having trouble hearing you over the
                                    waves. Try again in a moment.
                                </div>
                                {/* If a partial assistant reply already streamed in before the
                                    error, its own regenerate button (rendered above) already
                                    covers retrying - don't show a second one here. */}
                                {messages[messages.length - 1]?.role !==
                                    "assistant" && (
                                    <button
                                        type="button"
                                        onClick={() => regenerate()}
                                        title="Retry"
                                        aria-label="Retry"
                                        className="regenerate-button mt-1 ml-4 w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 p-3 border-t border-gray-200 rounded-b-xl"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your message..."
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-accent"
                />
                {isGenerating ? (
                    <Button
                        type="button"
                        onClick={stop}
                        className="send-button w-9 h-9 rounded-full text-white shrink-0"
                        aria-label="Stop generating"
                    >
                        <Square size={14} fill="currentColor" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        className="send-button w-9 h-9 rounded-full text-white disabled:cursor-not-allowed shrink-0"
                    >
                        <Send size={16} />
                    </Button>
                )}
            </form>
        </>
    );
}
