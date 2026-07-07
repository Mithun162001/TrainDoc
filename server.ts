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
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Map any deprecated model or placeholder to gemini-3.5-flash
function mapModelName(model: string | undefined): string {
  if (!model) return "gemini-3.5-flash";
  const m = model.toLowerCase();
  if (m.includes("gemini-1.5") || m.includes("gemini-2.0") || m.includes("gemini-2.5") || m.includes("gemini-pro")) {
    return "gemini-3.5-flash";
  }
  return model;
}

// Advanced Server-Side Prompt Tuning Compiler
function compilePromptAndSystemInstruction(
  moduleType: string | undefined,
  uploadedFileName: string,
  uploadedFileType: string,
  contextText: string,
  options: any,
  fallbackPrompt: string,
  fallbackSystemInstruction: string
): { prompt: string; systemInstruction: string } {
  if (!moduleType) {
    return { prompt: fallbackPrompt, systemInstruction: fallbackSystemInstruction };
  }

  let prompt = '';
  let systemInstruction = '';

  const filenameClean = uploadedFileName || 'uploaded_document';
  const sourceContext = contextText ? contextText.trim() : '';

  switch (moduleType) {
    case 'transcript': {
      const { diarization = true, language = 'English', granularity = 'sentence-level', ocrEnabled = false, speakerNames = {} } = options || {};
      const speakerList = Object.entries(speakerNames).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- Speaker 1: Trainer\n- Speaker 2: Participant';
      
      prompt = `Generate a highly realistic, technical, diarized transcript for the training session/video file "${filenameClean}".
The video/audio has been processed. Here are the configuration options to strictly honor:
1. Diarization enabled: ${diarization}
2. Primary Language: ${language}
3. Timestamp & Text Granularity: ${granularity}
4. OCR slide extraction integrated: ${ocrEnabled}

Expected Speaker Labels to assign:
${speakerList}

${sourceContext ? `Use this raw context/metadata extracted from slides/audio to base your transcript content on:\n\n${sourceContext}` : `Generate a highly detailed, comprehensive, professional and educational mock transcript for "${filenameClean}" covering technical system deployments, configurations, commands, and SLA handovers.`}

Format the output strictly as a structured chronological transcript using markdown. Prefix every line with a proper timestamp in [MM:SS] or [HH:MM:SS] format, e.g., "[00:15] **Trainer**: Welcome...". Break down into logical subsections with timestamped headings.`;

      systemInstruction = `You are an elite, highly professional Technical Audio Scribe, Specialist Stenographer, and Speech-to-Text Diarization Scribe.
Your primary objective is to output a clean, highly readable, structured training session transcript.
Ensure all technical terms, code commands, infrastructure terms (like Kubernetes, ReplicaSet, SRE, SLA, OOMKilled, Prometheus, YAML) are spelt and styled with standard capitalization.
Never invent non-factual timestamps (keep them logical and ascending).
Respond with the Markdown transcript only.`;
      break;
    }

    case 'summary': {
      const { length = 'medium', format = 'bullet points', highlightActionItems = true } = options || {};
      prompt = `Analyze the provided source context and create a master Summary Briefing for "${filenameClean}".
Settings to enforce:
- Target Length: ${length}
- Target Format Style: ${format}
- Highlight Action Items: ${highlightActionItems}

Source Context Material:
${sourceContext || `(No source transcript text available. Provide a beautifully detailed summary briefing for the technical subject of "${filenameClean}")`}

Make sure the summary covers core technical objectives, configurations discussed, SRE limits, and system thresholds.`;

      systemInstruction = `You are an expert Senior Systems Architect and Technical Writer.
Compile a flawless technical summary from the transcript or document provided.
If "Highlight Action Items" is enabled, you MUST extract real or logically derived technical action items, each prefixed with "⚡ **[ACTION]**" (e.g., "**[ACTION]** Configure memory limit parameters in staging").
Use precise systems terminology, bold key concepts, and organize into clean, elegant markdown subheadings. Avoid empty generalizations or fluffy text.`;
      break;
    }

    case 'faq': {
      const { dedupe = true, groupByTopic = true, topics = [], flagUnanswered = true } = options || {};
      const topicsStr = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'Infrastructure, Configuration, Operations';

      prompt = `Analyze the provided source context and compile a professional FAQ Classification Sheet for "${filenameClean}".
Settings to enforce:
1. Deduplication: ${dedupe} (combine similar/redundant Q&As)
2. Group by Topics: ${groupByTopic}
3. Targeted Topics: ${topicsStr}
4. Flag unanswered gaps or technical ambiguities: ${flagUnanswered}

Source Context Material:
${sourceContext || `(No source transcript text available. Provide standard FAQ sheet for the technical subject of "${filenameClean}")`}

Identify specific questions raised by participants during the training, or highly relevant questions that would occur to an engineer reading this documentation.`;

      systemInstruction = `You are a Principal Customer Solutions Engineer and technical educator.
Format your response strictly as a professional Q&A markdown document.
For each FAQ entry:
1. Categorize under a clean markdown heading "### Topic: [Topic Name]".
2. Format the question as "**Q: [Well-formulated technical question]**"
3. Format the answer as "*A: [Accurate, extremely detailed, and actionable answer derived from the source or core systems engineering practices]*"
4. (Optional) If timestamps are present in the context, append a timestamp reference, e.g., "_Source timestamp: [02:15]_"
If "Flag unanswered gaps" is enabled, identify areas in the source that were mentioned but lacked details, and include them labeled with "[FLAGGED - UNANSWERED SYSTEM GAP]".`;
      break;
    }

    case 'architectureReport': {
      const { includeDiagrams = true, depth = 'detailed technical breakdown', includeGlossary = true } = options || {};
      prompt = `Synthesize a rigorous, professional Systems Architecture Specification & Analysis Report for "${filenameClean}".
Settings:
- Evaluation Depth: ${depth}
- Include Glossary of Terms: ${includeGlossary}
- Include Interactive Diagram: ${includeDiagrams}

Source Context Material:
${sourceContext || `(No source transcript text available. Analyze the architectural design of the system represented by "${filenameClean}")`}

Compile a highly structured markdown report. Break it down into:
1. Executive Structural Analysis
2. Interface Protocols, Routing Handshakes, and Data Pipelines
3. Failure Mode & Resilience Strategies (e.g., node recovery, resource exhaustion, container lifecycle hooks)
4. Glossary of core terminology (if requested)

${includeDiagrams ? `IMPORTANT: Because "Include Diagrams" is enabled, you MUST output a complete, valid, beautifully designed and self-contained vector diagram in raw SVG format that visually models this system architecture.
The SVG diagram must look incredibly high-end, clean, and polished:
- Background: dark slate ('#0f172a' or '#0b0f19') with rounded corners.
- Dimensions: width="600" height="240" (viewBox="0 0 600 240").
- Style: Use beautiful rounded rectangles, clear font sizes, colored nodes with gradients (emerald green, teal, deep grey), and marker arrows showing unidirectional or bidirectional flow.
- Ensure the SVG has NO markdown backticks or extra text inside it; wrap the entire SVG code strictly within a \`\`\`xml ... \`\`\` code block at the end or middle of your response.` : ''}`;

      systemInstruction = `You are an elite Principal Cloud Systems Architect and Technical Graphics Designer.
Your documentation must be authoritative, detailed, and completely error-free.
Do not use ascii diagrams; if diagrams are enabled, generate a stunning, fully-formed, valid SVG within a \`\`\`xml ... \`\`\` code block. Ensure the SVG has perfect layout tags (<svg>, <rect>, <text>, <path>, <defs>) and is XML-compliant.`;
      break;
    }

    case 'wordDoc': {
      const { tone = 'Professional / Academic', structure = 'Chapter-by-Chapter Learning Guide', detailLevel = 'Comprehensive / Deep Dive', includeCharts = true, chartTypes = [], audienceVariant = 'Systems Engineer' } = options || {};
      const chartStr = Array.isArray(chartTypes) && chartTypes.length > 0 ? chartTypes.join(', ') : 'Flow matrix, configuration tables';

      prompt = `Compile a master Reference Guide ready for Word compilation for "${filenameClean}".
Settings to enforce strictly:
- Tone Profile: ${tone}
- Outline Structure: ${structure}
- Depth Profile: ${detailLevel}
- Target Audience Variant: ${audienceVariant}
- Include Charts/Matrices: ${includeCharts} (Chart styles requested: ${chartStr})

Source Context Material:
${sourceContext || `(No source transcript text available. Write a premium reference guide for the technical subject of "${filenameClean}")`}

Expected Layout:
Divide this guide into clean, numbered Chapters (e.g., Chapter 1: Core Concepts, Chapter 2: Configuration & Diagnostics, etc.).
Make it exceptionally detailed, with long paragraphs, detailed technical context, config parameter examples, and formatted ASCII matrices, flow tables, or lists.
This document is meant as a comprehensive reference guide to study for certification and production support.`;

      systemInstruction = `You are an elite Technical Author, Curriculum Architect, and Systems Specialist.
Write in a structured, exhaustive, highly professional academic tone.
Ensure no shortcuts are taken. Write out deep, detailed explanations for every point.
Incorporate detailed code blocks, configuration parameters (e.g. JSON/YAML snippets), or tabular ASCII charts representing system flows. Ensure beautiful markdown headers (#, ##, ###) for standard MS Word outline importation.`;
      break;
    }

    default:
      return { prompt: fallbackPrompt, systemInstruction: fallbackSystemInstruction };
  }

  return { prompt, systemInstruction };
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
        const response = await ai.models.generateContent({
          model: mapModelName(model),
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
    const { 
      provider, 
      endpoint, 
      model, 
      moduleType, 
      uploadedFileName = "", 
      uploadedFileType = "", 
      contextText = "", 
      options = {}, 
      prompt: rawPrompt = "", 
      systemInstruction: rawSystemInstruction = "" 
    } = req.body;

    // Compile customized prompts if moduleType is specified, otherwise fall back to raw input
    const { prompt, systemInstruction } = compilePromptAndSystemInstruction(
      moduleType,
      uploadedFileName,
      uploadedFileType,
      contextText,
      options,
      rawPrompt,
      rawSystemInstruction
    );

    if (provider === "gemini") {
      try {
        const ai = getGeminiClient();
        const geminiModel = mapModelName(model);

        console.log(`[Gemini Server Engine] Generating Content using ${geminiModel} for moduleType: ${moduleType || "custom"}`);

        const response = await ai.models.generateContent({
          model: geminiModel,
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });

        const textResult = response.text || "";
        let svgResult = "";

        // Extract SVG diagram if moduleType is architectureReport
        if (moduleType === "architectureReport" && options.includeDiagrams) {
          const xmlMatch = textResult.match(/```(?:xml|svg)\s*([\s\S]*?)```/) || textResult.match(/<svg[\s\S]*?<\/svg>/);
          if (xmlMatch) {
            svgResult = xmlMatch[1] || xmlMatch[0];
            svgResult = svgResult.trim();
          }
        }

        return res.json({ 
          success: true, 
          text: textResult, 
          svg: svgResult || undefined 
        });
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

        console.log(`[Ollama Proxy Engine] Sending Request for moduleType: ${moduleType || "custom"}`);

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
        const textResult = data.response || "";
        let svgResult = "";

        // Extract SVG diagram if moduleType is architectureReport
        if (moduleType === "architectureReport" && options.includeDiagrams) {
          const xmlMatch = textResult.match(/```(?:xml|svg)\s*([\s\S]*?)```/) || textResult.match(/<svg[\s\S]*?<\/svg>/);
          if (xmlMatch) {
            svgResult = xmlMatch[1] || xmlMatch[0];
            svgResult = svgResult.trim();
          }
        }

        return res.json({ 
          success: true, 
          text: textResult, 
          svg: svgResult || undefined 
        });
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
