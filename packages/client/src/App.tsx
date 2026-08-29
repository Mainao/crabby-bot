import { useState } from "react";
import crabby from "./assets/images/crabby.webp";
import ChatBox from "./components/chat/ChatBox";
import OceanScene from "./components/ocean/OceanScene";
import { Button } from "./components/ui/Button";
import { CRABBY_POSITION, CRABBY_SIZE } from "./lib/crabby-position";

export default function App() {
	const [isChatOpen, setIsChatOpen] = useState(false);

	return (
		<>
			<OceanScene />
			{!isChatOpen && (
				<Button position={CRABBY_POSITION} onClick={() => setIsChatOpen(true)}>
					<img
						src={crabby}
						alt="Chat with Crabby"
						style={{
							width: CRABBY_SIZE.width,
							height: CRABBY_SIZE.height,
						}}
					/>
				</Button>
			)}
			{isChatOpen && <ChatBox onClose={() => setIsChatOpen(false)} />}
		</>
	);
}
