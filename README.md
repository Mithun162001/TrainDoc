# TrainDoc Workspace

A user-controlled training documentation assistant built with React, TypeScript, and Express. Upload training videos or documents and compile structured outputs — transcripts, summaries, FAQs, architecture reports, and Word documents — using your choice of AI model provider.

No automatic triggers, no unrequested AI processing. Every generation step is explicit and configurable.

---

## Features

### Input Types
- **Video** — MP4, MOV, or WEBM training recordings. Supports speaker diarization with custom speaker names, timestamps, granularity control (sentence or topic), and sample-frame OCR.
- **Document** — PDF, DOCX, PPTX, or TXT files. Parsed structural layout is previewed before any compilation runs.

### Generated Output Modules
| Module | Description |
|---|---|
| **Transcript** | Diarized, timestamped transcript with configurable speaker name mapping |
| **Summary** | Configurable length, format (bullet points or narrative), and action-item highlighting |
| **FAQ** | Grouped by topic, deduplicated, with optional source timestamps |
| **Architecture Report** | Deep or overview technical breakdown with auto-generated SVG process diagrams |
| **Word Document** | Exportable `.docx` compiled from session outputs |

### Session Management
- Sessions persist in browser `localStorage` — no backend database required
- Library view with search, ingestion-type filter, topic filter, and date filter
- Each session tracks full versioned history of every generated document
- Sessions can be reopened to re-run generation with alternate configurations

### AI Model Providers
| Provider | How it works |
|---|---|
| **Sandbox Simulator** | Instant offline mock output. Recommended for testing and previewing the UI |
| **Ollama (Llama 3 / Local)** | Connects to a locally running Ollama instance. Use **Client-Side Direct Mode** when Ollama is on your own machine |
| **Google Gemini API** | Server-side proxy to `gemini-2.5-flash`. Requires a `GEMINI_API_KEY` |

A **Ping** test is available for all providers to verify connectivity before generating.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Express.js (Node.js), acts as a proxy for Gemini API calls
- **Document export**: `docx` library for `.docx` generation
- **Dev server**: `tsx` running `server.ts` on port **3000**

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- A Gemini API key — only required if using the **Google Gemini** provider

---

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and set your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   ```
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   > Skip this step if you only intend to use the **Sandbox Simulator** or **Ollama** providers.

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app runs at **http://localhost:3000**.

---

## Build & Deploy

```bash
# Build frontend (Vite) + bundle server (esbuild)
npm run build

# Start production server
npm start
```

The production server serves the compiled frontend from `dist/` and exposes the `/api/ping` and `/api/generate` proxy endpoints.

---

## Connecting a Local Ollama Instance

1. Install Ollama and pull a model:
   ```bash
   ollama pull llama3
   ```
2. Start Ollama with CORS enabled:
   ```bash
   OLLAMA_ORIGINS="*" ollama serve
   ```
3. In TrainDoc, go to **Model Provider** settings, select **Ollama (Llama 3 / Local)**, set the endpoint to `http://localhost:11434`, and enable **Client-Side Direct Mode**.
4. Click **Ping Model** to verify the connection.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ping` | Tests connectivity to the configured provider |
| `POST` | `/api/generate` | Proxies a generation request to Gemini or Ollama |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | For Gemini provider | Google Gemini API key |
| `APP_URL` | Optional | Hosted URL for self-referential links |
