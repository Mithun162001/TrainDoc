import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Ping LLM Endpoint or check Gemini API status
  app.post("/api/ping", async (req, res) => {
    const { provider, endpoint, model } = req.body;

    if (provider === "gemini") {
      try {
        const ai = getGeminiClient();
        // Simple test call with Gemini
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "ping",
        });
        return res.json({ success: true, message: "Gemini API connection successful!", response: response.text });
      } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || "Failed to connect to Gemini API" });
      }
    } else if (provider === "ollama") {
      // For Ollama, the server tries to ping the endpoint. 
      // Note: If Ollama is running on client's local machine, server ping to localhost will fail.
      // We will explain this in the response and also let the client-side handle it direct if preferred.
      try {
        const url = `${endpoint || "http://localhost:11434"}/api/tags`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return res.json({ 
            success: true, 
            message: `Successfully connected to Ollama at ${endpoint}!`, 
            details: data 
          });
        } else {
          return res.status(response.status).json({ 
            success: false, 
            error: `Ollama returned status ${response.status}` 
          });
        }
      } catch (error: any) {
        return res.json({ 
          success: false, 
          isLocalhostWarning: (endpoint || "").includes("localhost") || (endpoint || "").includes("127.0.0.1"),
          error: error.message || "Endpoint unreachable from Server. If Ollama is running on your local machine, please enable Client-Side direct mode in TrainDoc Settings." 
        });
      }
    } else {
      // Sandbox provider
      return res.json({ success: true, message: "Sandbox simulator is ready and functional!" });
    }
  });

  // API Route: Generation
  app.post("/api/generate", async (req, res) => {
    const { provider, endpoint, model, prompt, systemInstruction } = req.body;

    if (provider === "gemini") {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
        return res.json({ success: true, text: response.text });
      } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        return res.status(500).json({ success: false, error: error.message || "Gemini Generation failed" });
      }
    } else if (provider === "ollama") {
      try {
        const url = `${endpoint || "http://localhost:11434"}/api/generate`;
        const controller = new AbortController();
        // Give it a generous timeout (60s) for slow local LLMs
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model || "llama3",
            prompt: prompt,
            system: systemInstruction,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama server returned status ${response.status}`);
        }

        const data = await response.json();
        return res.json({ success: true, text: data.response });
      } catch (error: any) {
        console.error("Ollama Proxy Generation Error:", error);
        return res.status(500).json({ 
          success: false, 
          error: error.message || "Ollama generation failed. Please check endpoint connectivity." 
        });
      }
    } else {
      return res.status(400).json({ success: false, error: "Invalid provider for server-side generation" });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
