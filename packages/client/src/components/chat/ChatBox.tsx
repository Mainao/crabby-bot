import { X } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import crabbyAvatar from "../../assets/images/crabby.webp";
import { CRABBY_POSITION, CRABBY_SIZE } from "../../lib/crabby-position";
import { Button } from "../ui/Button";
import ChatContent from "./ChatContent";
import ChatErrorFallback from "./ChatErrorFallback";

interface ChatBoxProps {
    onClose: () => void;
}

export default function ChatBox({ onClose }: ChatBoxProps) {
    return (
        <div
            className="chatbox-popup fixed inset-x-3 top-3 bottom-3 sm:inset-x-auto sm:top-auto sm:w-130 sm:h-180 bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col z-200 font-chat"
            style={
                {
                    "--chat-bottom": `${CRABBY_POSITION.bottom}px`,
                    "--chat-right": `${CRABBY_POSITION.right}px`,
                } as React.CSSProperties
            }
        >
            <div className="chatbox-header relative flex items-center px-4 pt-4 pb-4 rounded-t-xl">
                <div className="crabby-avatar-wrap absolute -top-6 -left-3 sm:-top-10 sm:-left-16 z-10">
                    <div className="crabby-glow" />
                    <img
                        src={crabbyAvatar}
                        alt="Crabby"
                        className="relative object-contain w-20 h-28 sm:w-[var(--crabby-w)] sm:h-[var(--crabby-h)]"
                        style={
                            {
                                "--crabby-w": `${CRABBY_SIZE.width}px`,
                                "--crabby-h": `${CRABBY_SIZE.height}px`,
                            } as React.CSSProperties
                        }
                    />
                </div>

                <p className="text-white font-primary text-lg sm:text-xl ml-14 sm:ml-24">
                    Crabby
                </p>

                <Button
                    type="button"
                    onClick={onClose}
                    aria-label="Close chat"
                    className="absolute right-3 top-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                    <X size={16} />
                </Button>
            </div>

            <ErrorBoundary FallbackComponent={ChatErrorFallback}>
                <ChatContent />
            </ErrorBoundary>
        </div>
    );
}
