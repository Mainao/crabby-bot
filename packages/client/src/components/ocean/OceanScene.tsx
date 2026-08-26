import "./OceanScene.css";

export default function OceanScene() {
    return (
        <main className="ocean-scene">
            <h1 className="reef-title">Welcome to the Reef</h1>
            <div className="ocean-water" />
            <div className="bubbles">
                <div className="bubble bubble-1" />
                <div className="bubble bubble-2" />
                <div className="bubble bubble-3" />
                <div className="bubble bubble-4" />
            </div>

            <div className="sea-floor" />
        </main>
    );
}
