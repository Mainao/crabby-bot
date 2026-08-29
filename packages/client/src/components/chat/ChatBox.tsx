import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import crabbyAvatar from "../../assets/images/crabby.webp";
import { CRABBY_POSITION, CRABBY_SIZE } from "../../lib/crabby-position";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";

interface ChatBoxProps {
    onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
    "Why is the ocean blue?",
    "How do sharks hunt?",
    "What's bioluminescence?",
];

export default function ChatBox({ onClose }: ChatBoxProps) {
    const [input, setInput] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: `${import.meta.env.VITE_API_BASE_URL}/api/chat`,
        }),
    });

    const isStreaming = status === "streaming";

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

    return (
        <div
            className="chatbox-popup fixed  w-130 h-180 bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col z-200 font-chat"
            style={{
                bottom: `${CRABBY_POSITION.bottom}px`,
                right: `${CRABBY_POSITION.right}px`,
            }}
        >
            <div className="chatbox-header relative flex items-center px-4 pt-4 pb-4 rounded-t-xl">
                <div className="crabby-avatar-wrap absolute -top-10 -left-16 z-10">
                    <div className="crabby-glow" />
                    <img
                        src={crabbyAvatar}
                        alt="Crabby"
                        className="relative object-contain"
                        style={{
                            width: `${CRABBY_SIZE.width}px`,
                            height: `${CRABBY_SIZE.height}px`,
                        }}
                    />
                </div>

                <p className="text-white font-primary text-xl ml-24">Crabby</p>

                <Button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm"
                >
                    ✕
                </Button>
            </div>

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
                                        type="submit"
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
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                                        m.role === "user"
                                            ? "max-w-[80%] bg-user-msg text-white rounded-br-sm"
                                            : "w-full bg-white text-primary rounded-bl-sm"
                                    }`}
                                >
                                    <ReactMarkdown>
                                        {m.parts
                                            .map((part) =>
                                                part.type === "text"
                                                    ? part.text
                                                    : "",
                                            )
                                            .join("")}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isStreaming && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                                </div>
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
                    disabled={isStreaming}
                    className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-accent"
                />
                {isStreaming ? (
                    <Button
                        type="button"
                        onClick={stop}
                        className="send-button w-9 h-9 rounded-full text-white shrink-0"
                        aria-label="Stop generating"
                    >
                        ■
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={!input.trim()}
                        className="send-button w-9 h-9 rounded-full text-white disabled:cursor-not-allowed shrink-0"
                    >
                        ➤
                    </Button>
                )}
            </form>
        </div>
    );
}
