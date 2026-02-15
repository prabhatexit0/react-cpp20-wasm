import { useCallback, useRef, useState } from "react";
import { useWasmEngine } from "./hooks/useWasmEngine";

const CANVAS_ID = "gl-canvas";
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;

export default function App() {
  const { state, engine } = useWasmEngine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glReady, setGlReady] = useState(false);
  const [computeResult, setComputeResult] = useState<string | null>(null);
  const [primeLimit, setPrimeLimit] = useState(1_000_000);

  // ─── WebGL initialisation ──────────────────────────────────────────────
  const handleInitWebGL = useCallback(() => {
    if (!engine || !canvasRef.current) return;

    const ok = engine.initWebGL(CANVAS_ID);
    setGlReady(ok);

    if (!ok) {
      setComputeResult("Failed to create WebGL 2 context.");
    }
  }, [engine]);

  // ─── Colour rendering ─────────────────────────────────────────────────
  const handleRender = useCallback(
    (r: number, g: number, b: number) => {
      if (!engine || !glReady) return;
      engine.renderFrame(r, g, b);
    },
    [engine, glReady],
  );

  // ─── Prime computation ─────────────────────────────────────────────────
  const handleCompute = useCallback(() => {
    if (!engine) return;
    const t0 = performance.now();
    const result = engine.computePrimes(primeLimit);
    const elapsed = (performance.now() - t0).toFixed(2);
    setComputeResult(`${result}\nComputed in ${elapsed} ms`);
  }, [engine, primeLimit]);

  // ─── Status badge ──────────────────────────────────────────────────────
  const statusElement = (() => {
    switch (state.status) {
      case "loading":
        return <p className="status status--loading">Loading WASM engine...</p>;
      case "error":
        return <p className="status status--error">Error: {state.error}</p>;
      case "ready":
        return <p className="status status--ready">Engine ready</p>;
    }
  })();

  return (
    <div>
      <h1>React + C++20 WASM</h1>
      {statusElement}

      {/* ── WebGL Canvas ─────────────────────────────────────────────── */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          WebGL 2 Canvas
        </h2>
        <canvas
          ref={canvasRef}
          id={CANVAS_ID}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={handleInitWebGL}
            disabled={state.status !== "ready" || glReady}
          >
            {glReady ? "WebGL Initialised" : "Init WebGL"}
          </button>
          <button
            onClick={() => handleRender(0.39, 0.39, 1.0)}
            disabled={!glReady}
          >
            Blue
          </button>
          <button
            onClick={() => handleRender(0.2, 0.8, 0.4)}
            disabled={!glReady}
          >
            Green
          </button>
          <button
            onClick={() => handleRender(0.9, 0.3, 0.3)}
            disabled={!glReady}
          >
            Red
          </button>
          <button
            onClick={() =>
              handleRender(Math.random(), Math.random(), Math.random())
            }
            disabled={!glReady}
          >
            Random
          </button>
        </div>
      </section>

      {/* ── Compute Section ──────────────────────────────────────────── */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          C++20 Prime Sieve
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <label htmlFor="prime-limit">Limit:</label>
          <input
            id="prime-limit"
            type="number"
            value={primeLimit}
            onChange={(e) => setPrimeLimit(Number(e.target.value))}
            min={2}
            max={100_000_000}
            style={{
              padding: "0.4rem 0.6rem",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#16213e",
              color: "#e0e0e0",
              fontFamily: "inherit",
              width: "10rem",
            }}
          />
          <button onClick={handleCompute} disabled={state.status !== "ready"}>
            Compute Primes
          </button>
        </div>
        {computeResult && (
          <pre className="result">{computeResult}</pre>
        )}
      </section>
    </div>
  );
}
