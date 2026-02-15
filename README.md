# React + C++20 WASM Boilerplate

A production-ready boilerplate for building **Vite + React + TypeScript** applications with **C++20** compiled to **WebAssembly** via **Emscripten**.

## Architecture

```
react-cpp20-wasm/
├── cpp/                    # C++ source code
│   ├── CMakeLists.txt      # CMake build config (C++20, Emscripten)
│   └── main.cpp            # Engine: prime sieve + WebGL 2 init
├── src/
│   ├── wasm/               # WASM build output (generated, git-ignored)
│   │   ├── engine.js       # Emscripten ES6 loader
│   │   └── engine.wasm     # Compiled binary
│   ├── hooks/
│   │   └── useWasmEngine.ts  # React hook for async WASM loading
│   ├── wasm.d.ts           # TypeScript declarations for the C++ boundary
│   ├── App.tsx             # Main React component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── .vscode/                # VS Code DX configuration
│   ├── extensions.json     # Recommended extensions (clangd, CMake Tools)
│   ├── settings.json       # clangd args, IntelliSense disabled
│   └── c_cpp_properties.json  # Fallback C++ config
├── scripts/
│   └── build-wasm.sh       # Helper build script
├── vite.config.ts          # Vite config with WASM support
├── package.json            # NPM scripts & dependencies
└── tsconfig.json           # TypeScript configuration
```

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >= 18 | Frontend toolchain |
| **npm** | >= 9 | Package manager |
| **Emscripten SDK** | >= 3.1.50 | C++ → WASM compiler |
| **CMake** | >= 3.20 | C++ build system |
| **clangd** | >= 16 (optional) | C++ IDE intelligence |

## Setup

### 1. Install the Emscripten SDK

```bash
# Clone the SDK (one-time setup)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate the latest version
./emsdk install latest
./emsdk activate latest

# Add to current shell (run this in every new terminal, or add to your profile)
source ./emsdk_env.sh
```

Verify the installation:

```bash
emcc --version
# emcc (Emscripten gcc/clang-like replacement ...) 3.x.x
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Build the WASM engine

**Option A — Using npm scripts:**

```bash
# Configure CMake with Emscripten
npm run wasm:configure

# Build the WASM binary
npm run wasm:build
```

**Option B — Using the helper script:**

```bash
chmod +x scripts/build-wasm.sh
./scripts/build-wasm.sh
```

**Option C — All-in-one:**

```bash
npm run setup    # npm install + wasm:configure + wasm:build
```

After a successful build, you should see:
- `src/wasm/engine.js` — Emscripten ES6 module loader
- `src/wasm/engine.wasm` — Compiled WebAssembly binary
- `build/compile_commands.json` — For clangd IntelliSense

### 4. Start the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Development Workflow

### Editing C++ code

1. Edit files in `cpp/`.
2. Rebuild: `npm run wasm:build` (incremental) or `npm run wasm:rebuild` (clean).
3. Vite will hot-reload — refresh the browser to pick up the new WASM.

### Adding new C++ exports

1. Add the function in `cpp/main.cpp` and register it with `EMSCRIPTEN_BINDINGS`.
2. Update the TypeScript declarations in `src/wasm.d.ts`.
3. Rebuild: `npm run wasm:build`.
4. Use the new function via the `engine` object from `useWasmEngine()`.

### VS Code IntelliSense

The project is configured for **clangd** (not Microsoft's C++ extension):

- Install the recommended extensions when VS Code prompts you.
- `compile_commands.json` is generated automatically in `build/` during the WASM build.
- clangd picks it up automatically via `.vscode/settings.json`.

If IntelliSense is not working, ensure you've run the WASM build at least once so `compile_commands.json` exists.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build |
| `npm run wasm:configure` | Run `emcmake cmake` to configure the C++ build |
| `npm run wasm:build` | Build the WASM binary (incremental) |
| `npm run wasm:clean` | Remove build artifacts |
| `npm run wasm:rebuild` | Clean + configure + build |
| `npm run setup` | Install deps + full WASM build |

## Key Design Decisions

- **CMake over raw emcc**: Generates `compile_commands.json` for clangd, scales to multi-file projects, supports standard CMake workflows.
- **ES6 module output**: `MODULARIZE=1` + `EXPORT_ES6=1` produces a standard ES module that Vite can import and code-split naturally.
- **WASM output in `src/wasm/`**: Vite serves it directly during dev; the production build handles it as an asset.
- **TypeScript boundary typing**: `src/wasm.d.ts` provides strict types for every C++ export — no `any` at the WASM boundary.
- **`useWasmEngine` hook**: Handles async loading, error states, and cleanup in a React-idiomatic way.
