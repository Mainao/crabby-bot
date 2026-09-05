import type { FallbackProps } from "react-error-boundary";

export default function CrabbyErrorFallback({
    resetErrorBoundary,
}: FallbackProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-muted text-sm">
            <p>Crabby got tangled in some seaweed.</p>
            <button
                onClick={resetErrorBoundary}
                className="px-4 py-2 rounded-full border border-accent text-accent bg-white cursor-pointer hover:bg-accent hover:text-white transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
