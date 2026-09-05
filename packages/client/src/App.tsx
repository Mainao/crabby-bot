import { lazy, Suspense, useState } from "react";
import crabby from "./assets/images/crabby.webp";
import OceanScene from "./components/ocean/OceanScene";
import { Button } from "./components/ui/Button";
import { CRABBY_POSITION, CRABBY_SIZE } from "./lib/crabby-position";

const ChatBox = lazy(() => import("./components/chat/ChatBox"));

export default function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <OceanScene />
            <Button
                position={CRABBY_POSITION}
                onClick={() => setIsChatOpen(true)}
                aria-hidden={isChatOpen}
                tabIndex={isChatOpen ? -1 : 0}
            >
                <img
                    src={crabby}
                    alt="Chat with Crabby"
                    style={{
                        width: CRABBY_SIZE.width,
                        height: CRABBY_SIZE.height,
                    }}
                />
            </Button>
            {isChatOpen && (
                <Suspense fallback={null}>
                    <ChatBox onClose={() => setIsChatOpen(false)} />
                </Suspense>
            )}
        </>
    );
}
