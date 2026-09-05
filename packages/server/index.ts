import { httpServerHandler } from "cloudflare:node";
import app from "./app.ts";

const port = process.env.PORT || 3000;

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
