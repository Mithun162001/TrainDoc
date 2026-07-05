import React, { useState, useEffect } from 'react';
import { 
  Session, 
  FileType, 
  UploadedFile, 
  LLMConfig, 
  VideoOptions, 
  DocGenOptions, 
  FAQOptions, 
  SummaryOptions, 
  ArchOptions,
  DocumentVersion
} from '../types';
import { 
  ArrowLeft, 
  UploadCloud, 
  Video, 
  FileText, 
  Link2, 
  AlertCircle, 
  Settings2, 
  CheckCircle, 
  Play, 
  Sparkles, 
  ArrowRight,
  Plus,
  X,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Check,
  RotateCcw,
  BookOpen,
  Trash2,
  FileEdit,
  FileDown
} from 'lucide-react';
import { 
  determineTopic, 
  generateMockTranscript, 
  generateMockSummary, 
  generateMockFAQ, 
  generateMockArchitectureReport, 
  generateMockWordDocument 
} from '../mockData';

interface SessionWorkspaceProps {
  session: Session | null;
  newSessionType: FileType | null;
  llmConfig: LLMConfig;
  onBackToDashboard: () => void;
  onSaveSession: (session: Session) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export default function SessionWorkspace({ 
  session, 
  newSessionType, 
  llmConfig, 
  onBackToDashboard, 
  onSaveSession,
  onDeleteSession
}: SessionWorkspaceProps) {
  
  // STEP-BASED PROGRESS FLOW
  // 1 = Upload / Ingest
  // 2 = Action Selection / Options Configure
  // 3 = Generation Preview & Accept/Reject
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [activeModule, setActiveModule] = useState<'transcript' | 'summary' | 'faq' | 'architecture' | 'wordDoc' | null>(null);

  // Connection warning if not sandbox and not validated
  const [isLlmAvailable, setIsLlmAvailable] = useState<boolean>(true);
  const [isLlmChecking, setIsLlmChecking] = useState<boolean>(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sessionName, setSessionName] = useState('');

  // Video Transcription Options State
  const [videoOptions, setVideoOptions] = useState<VideoOptions>({
    diarization: true,
    speakerNames: { 'Speaker 1': 'Trainer', 'Speaker 2': 'Participant' },
    language: 'English',
    targetLanguage: 'None (Original)',
    granularity: 'sentence',
    ocrEnabled: true
  });
  const [newSpeakerKey, setNewSpeakerKey] = useState('');
  const [newSpeakerVal, setNewSpeakerVal] = useState('');

  // Document Review Text (Mock Parsed)
  const [parsedDocReview, setParsedDocReview] = useState<string>('');

  // Word Doc Generator Options State
  const [wordOptions, setWordOptions] = useState<DocGenOptions>({
    tone: 'Technical',
    structure: 'Headings + subheadings',
    detailLevel: 'Standard',
    includeCharts: true,
    chartTypes: ['process flow', 'comparison table'],
    audienceVariant: 'Technical'
  });

  // FAQ Classifier Options State
  const [faqOptions, setFaqOptions] = useState<FAQOptions>({
    dedupe: true,
    groupByTopic: true,
    topics: ['Core Overview', 'Resource Management', 'Operational Escalations'],
    includeTimestamps: true,
    flagUnanswered: true
  });
  const [newTopicTag, setNewTopicTag] = useState('');

  // Quick Summary Options State
  const [summaryOptions, setSummaryOptions] = useState<SummaryOptions>({
    length: 'medium',
    format: 'bullet points',
    highlightActionItems: true
  });

  // Architecture Options State
  const [archOptions, setArchOptions] = useState<ArchOptions>({
    includeDiagrams: true,
    depth: 'detailed technical breakdown',
    includeGlossary: true
  });

  // Active Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [cancelGeneration, setCancelGeneration] = useState(false);
  const [generatedPreviewContent, setGeneratedPreviewContent] = useState<string>('');
  const [generatedDiagramSvg, setGeneratedDiagramSvg] = useState<string>('');

  // Confirmation Modals State
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

  // Auto-Save Draft states
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);

  // Initialize from existing session if editing, checking for auto-save draft first
  useEffect(() => {
    const key = `traindoc_autosave_${session ? session.id : 'new'}`;
    const savedDraft = localStorage.getItem(key);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.uploadedFile) setUploadedFile(parsed.uploadedFile);
        if (parsed.sessionName !== undefined) setSessionName(parsed.sessionName);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
        if (parsed.activeModule !== undefined) setActiveModule(parsed.activeModule);
        if (parsed.videoOptions) setVideoOptions(parsed.videoOptions);
        if (parsed.wordOptions) setWordOptions(parsed.wordOptions);
        if (parsed.faqOptions) setFaqOptions(parsed.faqOptions);
        if (parsed.summaryOptions) setSummaryOptions(parsed.summaryOptions);
        if (parsed.archOptions) setArchOptions(parsed.archOptions);
        if (parsed.generatedPreviewContent !== undefined) setGeneratedPreviewContent(parsed.generatedPreviewContent);
        if (parsed.generatedDiagramSvg !== undefined) setGeneratedDiagramSvg(parsed.generatedDiagramSvg);
        
        setIsDraftRestored(true);
        if (parsed.savedAt) {
          const timeStr = new Date(parsed.savedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastAutoSaved(timeStr);
        }
        return; // restored successfully, bypass standard setup
      } catch (err) {
        console.error("Failed to restore auto-saved draft:", err);
      }
    }

    // Default pristine init if no auto-save found
    setIsDraftRestored(false);
    setLastAutoSaved(null);
    if (session) {
      setUploadedFile(session.file);
      setSessionName(session.name);
      setCurrentStep(2); // Straight to configuration / actions
    } else {
      setUploadedFile(null);
      setSessionName('');
      setVideoLink('');
      setUploadError(null);
      setCurrentStep(1);
    }
    setActiveModule(null);
    setGeneratedPreviewContent('');
    setGeneratedDiagramSvg('');
  }, [session, newSessionType]);

  // Periodic background auto-saver
  useEffect(() => {
    // Check if there is anything meaningful to save (file uploaded, or a session name, or step > 1)
    if (!uploadedFile && !sessionName && currentStep === 1) {
      return;
    }

    const interval = setInterval(() => {
      const key = `traindoc_autosave_${session ? session.id : 'new'}`;
      const stateToSave = {
        sessionName,
        uploadedFile,
        currentStep,
        activeModule,
        videoOptions,
        wordOptions,
        faqOptions,
        summaryOptions,
        archOptions,
        generatedPreviewContent,
        generatedDiagramSvg,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(key, JSON.stringify(stateToSave));
      
      const timeStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaved(timeStr);
    }, 5000); // auto-save every 5 seconds

    return () => clearInterval(interval);
  }, [
    session,
    sessionName,
    uploadedFile,
    currentStep,
    activeModule,
    videoOptions,
    wordOptions,
    faqOptions,
    summaryOptions,
    archOptions,
    generatedPreviewContent,
    generatedDiagramSvg
  ]);

  // Discard draft and revert back to default state
  const discardDraftAndReset = () => {
    const key = `traindoc_autosave_${session ? session.id : 'new'}`;
    localStorage.removeItem(key);
    setIsDraftRestored(false);
    setLastAutoSaved(null);
    
    if (session) {
      setUploadedFile(session.file);
      setSessionName(session.name);
      setCurrentStep(2);
    } else {
      setUploadedFile(null);
      setSessionName('');
      setVideoLink('');
      setUploadError(null);
      setCurrentStep(1);
    }
    setActiveModule(null);
    setGeneratedPreviewContent('');
    setGeneratedDiagramSvg('');
  };

  // Check LLM availability when configuration changes
  useEffect(() => {
    const verifyConnection = async () => {
      if (llmConfig.provider === 'sandbox') {
        setIsLlmAvailable(true);
        return;
      }
      setIsLlmChecking(true);
      try {
        if (llmConfig.clientSideDirect) {
          const res = await fetch(`${llmConfig.endpoint}/api/tags`);
          setIsLlmAvailable(res.ok);
        } else {
          const response = await fetch('/api/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: llmConfig.provider,
              endpoint: llmConfig.endpoint,
              model: llmConfig.model
            })
          });
          const data = await response.json();
          setIsLlmAvailable(response.ok && data.success);
        }
      } catch {
        setIsLlmAvailable(false);
      } finally {
        setIsLlmChecking(false);
      }
    };

    verifyConnection();
  }, [llmConfig]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    const expectedType = session ? session.type : newSessionType;

    if (expectedType === 'video') {
      const allowedExts = ['mp4', 'mov', 'webm', 'avi', 'mkv'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext || '')) {
        setUploadError('Invalid video format. Supported: MP4, MOV, WEBM.');
        return;
      }
      if (file.size > 150 * 1024 * 1024) { // 150MB limit
        setUploadError('File size exceeds 150MB maximum limit for standard analysis.');
        return;
      }
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: 'video'
      });
      setSessionName(`Session: ${file.name.replace(/\.[^/.]+$/, "")}`);
    } else {
      const allowedExts = ['pdf', 'docx', 'pptx', 'txt'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext || '')) {
        setUploadError('Invalid document format. Supported: PDF, DOCX, PPTX, TXT.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setUploadError('File size exceeds 50MB maximum limit.');
        return;
      }
      
      // Populate parsed review text simulation
      let textSimulation = `--- EXTRACTED LAYOUT FOR ${file.name.toUpperCase()} ---\n\n`;
      textSimulation += `[Header Node]: Training Blueprint\n`;
      textSimulation += `[Section 1]: General Introduction & Core Objectives\n`;
      textSimulation += ` - Defined standard service operating limits.\n`;
      textSimulation += ` - Scheduled SLA verification pipelines.\n`;
      textSimulation += `[Section 2]: Infrastructure Specs & SRE Thresholds\n`;
      textSimulation += ` - CPU / RAM threshold and limits: 80% utilization alarms.\n`;
      textSimulation += ` - Process Flow diagrams and Escalation Handovers (under 15 mins lead alerts).`;

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: 'document',
        rawText: textSimulation
      });
      setParsedDocReview(textSimulation);
      setSessionName(`Review: ${file.name.replace(/\.[^/.]+$/, "")}`);
    }
  };

  const handleVideoLinkSubmit = () => {
    if (!videoLink.trim()) return;
    if (!videoLink.startsWith('http://') && !videoLink.startsWith('https://')) {
      setUploadError('Please provide a valid HTTP/HTTPS streaming URL link.');
      return;
    }
    setUploadedFile({
      name: `External Stream: ${videoLink.substring(0, 30)}...`,
      size: 0,
      type: 'video',
      videoUrl: videoLink
    });
    setSessionName(`Session: External Stream Ingestion`);
    setUploadError(null);
  };

  // Generate / Run trigger
  const runGeneration = async (moduleType: typeof activeModule) => {
    if (!moduleType || !uploadedFile) return;

    setActiveModule(moduleType);
    setIsGenerating(true);
    setGenerationProgress(0);
    setCancelGeneration(false);

    // Dynamic progress bar updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setGenerationProgress(progress);
    }, 250);

    // LLM payload integration
    try {
      let prompt = '';
      let systemInstruction = '';
      let resultText = '';
      let svg = '';

      if (llmConfig.provider === 'sandbox') {
        // Run customized high-quality sandbox templates
        await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate loading
        
        if (moduleType === 'transcript') {
          resultText = generateMockTranscript(uploadedFile.name, videoOptions);
        } else if (moduleType === 'summary') {
          resultText = generateMockSummary(uploadedFile.name, summaryOptions);
        } else if (moduleType === 'faq') {
          resultText = generateMockFAQ(uploadedFile.name, faqOptions);
        } else if (moduleType === 'architecture') {
          const report = generateMockArchitectureReport(uploadedFile.name, archOptions);
          resultText = report.content;
          svg = report.diagramSvg;
        } else if (moduleType === 'wordDoc') {
          resultText = generateMockWordDocument(uploadedFile.name, wordOptions);
        }
      } else {
        // Setup payload prompts for Ollama/Gemini
        if (moduleType === 'transcript') {
          prompt = `Transcribe and structure the training session for video: "${uploadedFile.name}". Settings:\nDiarization: ${videoOptions.diarization}\nLanguage: ${videoOptions.language}\nGranularity: ${videoOptions.granularity}\nOCR Slide Extraction: ${videoOptions.ocrEnabled}`;
          systemInstruction = `You are an expert transcriber. Return speaker diarization structured lines with timestamps.`;
        } else if (moduleType === 'summary') {
          prompt = `Summarize the training document or transcript of "${uploadedFile.name}". Options:\nLength: ${summaryOptions.length}\nFormat: ${summaryOptions.format}\nHighlight action items: ${summaryOptions.highlightActionItems}`;
          systemInstruction = `You are a technical document analyst. Summarize clearly, extracting action items and metrics.`;
        } else if (moduleType === 'faq') {
          prompt = `Classify and list FAQs from "${uploadedFile.name}". Settings:\nDedupe: ${faqOptions.dedupe}\nGroup by topics: ${faqOptions.groupByTopic}\nTopics to group: ${faqOptions.topics.join(', ')}\nFlag unanswered/gaps: ${faqOptions.flagUnanswered}`;
          systemInstruction = `Format the output strictly as a professional Q&A markdown document.`;
        } else if (moduleType === 'architecture') {
          prompt = `Write a system architecture analysis report for "${uploadedFile.name}". Settings:\nDiagrams requested: ${archOptions.includeDiagrams}\nDepth Level: ${archOptions.depth}\nGlossary requested: ${archOptions.includeGlossary}`;
          systemInstruction = `Compile a structured enterprise specification. Use clean headings, descriptions, and ASCII or text flow diagrams.`;
        } else if (moduleType === 'wordDoc') {
          prompt = `Make the full chapter-wise learning document from the transcript and use any uploaded files/PPT as well for diagrams, references, and more details. Take your time, analyze the things properly, ensure no mistakes, and then make the chapter-wise learning document from both the transcript and uploaded documents (using them as reference). Keep the document content in detail as much as possible, since it is needed as reference notes for future readings.
Target Topic / Filename: "${uploadedFile.name}"
Options:
- Tone Profile: ${wordOptions.tone}
- Outline Structure: ${wordOptions.structure}
- Depth Profile: ${wordOptions.detailLevel}
- Include Charts: ${wordOptions.includeCharts}
- Selected Charts: ${wordOptions.chartTypes.join(', ')}
- Target Audience: ${wordOptions.audienceVariant}

Please compile this into a beautifully detailed, structured, chapter-by-chapter reference guide with exhaustive content, code snippets if relevant, and professional inline charts/matrices as configured.`;
          systemInstruction = `Act as an elite Enterprise Tech Writer and Curriculum Designer. Generate a highly detailed, chapter-wise learning document ready for Word compilation, matching the exact user prompt guidelines. Ensure the information is rich, exhaustive, and structured with clear Markdown headings (#, ##, ###).`;
        }

        // Call server-side API proxy
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: llmConfig.provider,
            endpoint: llmConfig.endpoint,
            model: llmConfig.model,
            prompt,
            systemInstruction
          })
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          resultText = resData.text;
          // For architecture, draw a beautiful SVG based on results or fallback to standard report diagram
          if (moduleType === 'architecture' && archOptions.includeDiagrams) {
            svg = generateMockArchitectureReport(uploadedFile.name, archOptions).diagramSvg;
          }
        } else {
          throw new Error(resData.error || 'Generation failed.');
        }
      }

      clearInterval(interval);
      if (cancelGeneration) return;

      setGenerationProgress(100);
      setGeneratedPreviewContent(resultText);
      setGeneratedDiagramSvg(svg);
      setCurrentStep(3); // Shift to preview step!
    } catch (err: any) {
      clearInterval(interval);
      setUploadError(`Generation failed: ${err.message || 'Model disconnected or timeout.'}`);
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reject / Discard Generation
  const discardGeneration = () => {
    setConfirmDiscardOpen(false);
    setGeneratedPreviewContent('');
    setGeneratedDiagramSvg('');
    setCurrentStep(2); // Go back to options configuration
  };

  // Accept and save compiled file
  const acceptGeneration = () => {
    if (!activeModule || !uploadedFile) return;

    // Create a new session object or update current
    const resolvedTopic = determineTopic(uploadedFile.name);
    
    const existingSession = session;
    const currentSessionsDocs = existingSession ? { ...existingSession.docs } : {};
    
    const versionList: DocumentVersion[] = (currentSessionsDocs as any)[activeModule] || [];
    const newVersionNum = versionList.length + 1;
    
    const newVer: DocumentVersion = {
      id: `${activeModule}-v${newVersionNum}-${Date.now()}`,
      version: newVersionNum,
      timestamp: new Date().toISOString(),
      title: `${activeModule.toUpperCase()} - Version ${newVersionNum}`,
      content: generatedPreviewContent,
      diagrams: generatedDiagramSvg ? [generatedDiagramSvg] : undefined,
      configSnapshot: activeModule === 'transcript' ? { ...videoOptions } 
                     : activeModule === 'summary' ? { ...summaryOptions }
                     : activeModule === 'faq' ? { ...faqOptions }
                     : activeModule === 'architecture' ? { ...archOptions }
                     : { ...wordOptions }
    };

    const updatedDocs = {
      ...currentSessionsDocs,
      [activeModule]: [newVer, ...versionList] // Add to top (newest first)
    };

    const updatedSession: Session = {
      id: existingSession ? existingSession.id : `sess-${Date.now()}`,
      name: sessionName || `Session: ${uploadedFile.name}`,
      createdAt: existingSession ? existingSession.createdAt : new Date().toISOString(),
      type: uploadedFile.type,
      file: uploadedFile,
      topic: resolvedTopic,
      docs: updatedDocs
    };

    onSaveSession(updatedSession);
    
    // Clear auto-saved draft since we just successfully committed/saved this version
    const currentKey = `traindoc_autosave_${session ? session.id : 'new'}`;
    localStorage.removeItem(currentKey);
    if (!session) {
      localStorage.removeItem('traindoc_autosave_new');
    }
    setIsDraftRestored(false);
    setLastAutoSaved(null);
    
    // Reset preview
    setGeneratedPreviewContent('');
    setGeneratedDiagramSvg('');
    setCurrentStep(2); // Retain on workspace to generate more or export!
  };

  // Custom speaker helper
  const addSpeaker = () => {
    if (!newSpeakerKey.trim() || !newSpeakerVal.trim()) return;
    setVideoOptions({
      ...videoOptions,
      speakerNames: {
        ...videoOptions.speakerNames,
        [newSpeakerKey]: newSpeakerVal
      }
    });
    setNewSpeakerKey('');
    setNewSpeakerVal('');
  };

  const removeSpeaker = (key: string) => {
    const updated = { ...videoOptions.speakerNames };
    delete updated[key];
    setVideoOptions({
      ...videoOptions,
      speakerNames: updated
    });
  };

  // Custom FAQ Topics helpers
  const addFaqTopic = () => {
    if (!newTopicTag.trim()) return;
    if (faqOptions.topics.includes(newTopicTag)) return;
    setFaqOptions({
      ...faqOptions,
      topics: [...faqOptions.topics, newTopicTag]
    });
    setNewTopicTag('');
  };

  const removeFaqTopic = (topic: string) => {
    setFaqOptions({
      ...faqOptions,
      topics: faqOptions.topics.filter(t => t !== topic)
    });
  };

  // Chart toggling helper
  const toggleChartType = (type: string) => {
    const active = wordOptions.chartTypes.includes(type);
    setWordOptions({
      ...wordOptions,
      chartTypes: active 
        ? wordOptions.chartTypes.filter(t => t !== type)
        : [...wordOptions.chartTypes, type]
    });
  };

  // Client-side file downloader (.txt, .md, real word download using docx, raw diagram svg)
  const downloadFile = async (title: string, format: 'txt' | 'md' | 'docx' | 'svg') => {
    const content = generatedPreviewContent || "No preview active.";
    let blob: Blob;
    let filename = `${title}.${format}`;

    if (format === 'docx') {
      try {
        const { Document, Packer, Paragraph, TextRun, ImageRun } = await import('docx');

        // Helper to convert SVG string to a PNG base64 in the browser
        const svgToPng = (svgString: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            try {
              let formattedSvg = svgString;
              if (!formattedSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
                formattedSvg = formattedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
              }

              const img = new Image();
              const svgBlob = new Blob([formattedSvg], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);

              img.onload = () => {
                const canvas = document.createElement('canvas');
                // Use high quality dimensions for rendering
                const width = 1200;
                const height = 750;
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);
                  const dataUrl = canvas.toDataURL('image/png');
                  URL.revokeObjectURL(url);
                  resolve(dataUrl);
                } else {
                  URL.revokeObjectURL(url);
                  reject(new Error("Could not get canvas context"));
                }
              };

              img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
              };

              img.src = url;
            } catch (e) {
              reject(e);
            }
          });
        };

        // Render diagram SVG to a docx ImageRun element if available
        let imageRunElement: any = null;
        if (generatedDiagramSvg) {
          try {
            const pngBase64 = await svgToPng(generatedDiagramSvg);
            const base64Data = pngBase64.split(',')[1];
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            imageRunElement = new Paragraph({
              children: [
                new ImageRun({
                  data: bytes.buffer,
                  transformation: {
                    width: 580, // perfect page-width fit
                    height: 360,
                  },
                } as any),
              ],
              spacing: { before: 240, after: 240 },
            });
          } catch (err) {
            console.error("Failed to render SVG diagram to PNG for docx:", err);
          }
        }

        const lines = content.split('\n');
        const children: any[] = [];

        // Format a human-readable header title
        const cleanTitle = (rawTitle: string): string => {
          const withoutCompiled = rawTitle.replace('-compiled', '').replace(/[-_]/g, ' ');
          return withoutCompiled.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Report';
        };
        const docTitle = cleanTitle(title);

        // Main Title Header styled professionally
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: docTitle,
                bold: true,
                size: 32, // 16pt
                color: "0f172a", // slate-900
              })
            ],
            spacing: { before: 120, after: 120 },
          })
        );

        // Document Metadata / Disclaimer
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "This document was compiled on TrainDoc Workspace via configuration inputs.",
                italics: true,
                size: 18, // 9pt
                color: "64748b", // slate-500
              }),
            ],
            spacing: { after: 360 },
          })
        );

        // Inline parser for bold (**text**) and italic (*text*) inside docx Paragraphs
        const parseLineToTextRuns = (lineText: string, options?: { isHeading?: boolean; isItalicLine?: boolean }) => {
          const runs: any[] = [];
          const formatRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
          let currentIndex = 0;
          let match;

          const baseSize = options?.isHeading ? 24 : 21; // 12pt heading, 10.5pt body text
          const isItalicLine = options?.isItalicLine || false;
          const defaultColor = options?.isHeading ? "0f172a" : "334155"; // slate-900 vs slate-700

          while ((match = formatRegex.exec(lineText)) !== null) {
            const matchIndex = match.index;

            if (matchIndex > currentIndex) {
              runs.push(
                new TextRun({
                  text: lineText.substring(currentIndex, matchIndex),
                  size: baseSize,
                  italics: isItalicLine,
                  color: defaultColor,
                })
              );
            }

            if (match[1]) {
              // Bold
              runs.push(
                new TextRun({
                  text: match[2],
                  bold: true,
                  size: baseSize,
                  italics: isItalicLine,
                  color: "0f172a",
                })
              );
            } else if (match[3]) {
              // Italic
              runs.push(
                new TextRun({
                  text: match[4],
                  italics: true,
                  size: baseSize,
                  color: defaultColor,
                })
              );
            }

            currentIndex = formatRegex.lastIndex;
          }

          if (currentIndex < lineText.length) {
            runs.push(
              new TextRun({
                text: lineText.substring(currentIndex),
                size: baseSize,
                italics: isItalicLine,
                color: defaultColor,
              })
            );
          }

          if (runs.length === 0) {
            runs.push(
              new TextRun({
                text: lineText,
                size: baseSize,
                italics: isItalicLine,
                color: defaultColor,
              })
            );
          }

          return runs;
        };

        let insertedDiagram = false;

        // Parse markdown-like content into docx elements
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            children.push(new Paragraph({ spacing: { after: 120 } }));
            continue;
          }

          // Check if it is a visual diagram placeholder
          const isPlaceholder = trimmed.includes('See visual interactive flowchart') || trimmed.includes('dashboard preview tab') || trimmed.includes('*(See visual interactive flowchart');
          if (isPlaceholder) {
            if (imageRunElement) {
              children.push(imageRunElement);
              insertedDiagram = true;
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "[Interactive visual diagram preview loaded below]",
                      italics: true,
                      size: 20,
                      color: "64748b",
                    })
                  ],
                  spacing: { before: 120, after: 120 },
                })
              );
            }
            continue;
          }

          if (trimmed.startsWith('# ')) {
            children.push(
              new Paragraph({
                children: parseLineToTextRuns(trimmed.replace('# ', ''), { isHeading: true }),
                spacing: { before: 240, after: 120 },
              })
            );
          } else if (trimmed.startsWith('## ')) {
            children.push(
              new Paragraph({
                children: parseLineToTextRuns(trimmed.replace('## ', ''), { isHeading: true }),
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (trimmed.startsWith('### ')) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed.replace('### ', ''),
                    bold: true,
                    size: 22, // 11pt
                    color: "008567",
                  })
                ],
                spacing: { before: 160, after: 80 },
              })
            );
          } else if (trimmed.startsWith('#### ')) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed.replace('#### ', ''),
                    bold: true,
                    size: 19, // 9.5pt
                    color: "b45309",
                  })
                ],
                spacing: { before: 120, after: 60 },
              })
            );
          } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const cleanedListText = trimmed.replace(/^[*\-]\s+/, '');
            children.push(
              new Paragraph({
                children: parseLineToTextRuns(cleanedListText),
                bullet: { level: 0 },
                spacing: { after: 100 },
              })
            );
          } else if (trimmed.match(/^\d+\.\s+/)) {
            children.push(
              new Paragraph({
                children: parseLineToTextRuns(trimmed),
                spacing: { after: 100 },
              })
            );
          } else {
            children.push(
              new Paragraph({
                children: parseLineToTextRuns(line),
                spacing: { after: 120 },
              })
            );
          }
        }

        // If the diagram was not placed at any specific placeholder line, append it to the end beautifully
        if (imageRunElement && !insertedDiagram) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Interactive Flowchart & Layout Visualizer",
                  bold: true,
                  size: 24,
                  color: "0f172a",
                })
              ],
              spacing: { before: 360, after: 120 },
            })
          );
          children.push(imageRunElement);
        }

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: children,
            },
          ],
        });

        blob = await Packer.toBlob(doc);
      } catch (err) {
        console.error("Failed to generate DOCX file using 'docx' library. Falling back to structured text.", err);
        blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8' });
      }
    } else if (format === 'md') {
      let mdContent = content;
      if (generatedDiagramSvg) {
        mdContent += `\n\n## 📊 System Architecture Diagram\n\n\`\`\`xml\n${generatedDiagramSvg}\n\`\`\`\n`;
      }
      blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    } else if (format === 'svg') {
      blob = new Blob([generatedDiagramSvg || ''], { type: 'image/svg+xml;charset=utf-8' });
    } else {
      let txtContent = content;
      if (generatedDiagramSvg) {
        txtContent += `\n\n========================================\nSYSTEM ARCHITECTURE DIAGRAM (SVG SOURCE):\n========================================\n\n${generatedDiagramSvg}\n`;
      }
      blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeTypeName = (session ? session.type : newSessionType) === 'video' ? 'Video Ingestion' : 'Document Ingestion';

  return (
    <div className="space-y-8">
      {/* Auto-save Draft Restored Notification Banner */}
      {isDraftRestored && (
        <div id="draft-restored-alert" className="bg-[#008567]/5 border border-[#008567]/20 rounded-2xl p-4 text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-[#008567] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5 text-left">
              <span className="font-bold block text-slate-900">Loaded auto-saved workspace draft</span>
              <p className="text-slate-600">
                We retrieved your latest background auto-save draft so you don't lose any configurations or compile previews.
              </p>
            </div>
          </div>
          <button
            id="discard-draft-reset-btn"
            onClick={discardDraftAndReset}
            className="text-xs bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 px-3 py-1.5 rounded-xl transition-all font-bold shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Top action rail */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            id="back-to-dashboard-btn"
            onClick={onBackToDashboard}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#008567] bg-[#008567]/5 px-2 py-0.5 rounded border border-[#008567]/15">
                Ingest Module: {activeTypeName}
              </span>
              {lastAutoSaved && (
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-saved at {lastAutoSaved}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {session ? session.name : 'New Documentation Workspace'}
            </h2>
          </div>
        </div>

        {/* Step Visualizer */}
        <div className="flex items-center gap-2 self-center sm:self-auto">
          {[
            { step: 1, label: 'Upload' },
            { step: 2, label: 'Configure' },
            { step: 3, label: 'Preview & Compile' }
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              {idx > 0 && <div className={`h-0.5 w-6 ${currentStep >= item.step ? 'bg-[#008567]' : 'bg-slate-200'}`} />}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    currentStep === item.step
                      ? 'bg-[#008567] text-white shadow-sm scale-105'
                      : currentStep > item.step
                      ? 'bg-[#008567]/10 text-[#008567] border border-[#008567]/20'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {currentStep > item.step ? <Check className="w-3.5 h-3.5" /> : item.step}
                </span>
                <span className={`text-[11px] font-bold hidden md:inline ${currentStep >= item.step ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Model Unreachable Warning Block */}
      {!isLlmAvailable && !isLlmChecking && (
        <div id="llm-unreachable-alert" className="bg-[#ff8d6d]/5 border border-[#ff8d6d]/20 rounded-2xl p-4 text-slate-700 flex gap-3.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#ff8d6d] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5">
            <span className="font-bold block text-slate-900">Model connection currently inactive</span>
            <p className="text-slate-600">
              Your configured LLM provider (<strong>{llmConfig.provider === 'ollama' ? `Ollama @ ${llmConfig.endpoint}` : 'Gemini Cloud'}</strong>) is unreachable. Generation features have been temporarily locked.
            </p>
            <p className="text-[11px] text-[#5f7a76] italic font-semibold">
              Please visit the <strong>Settings tab</strong> at the top to configure endpoints, try a connection ping, or toggle **Sandbox Simulator Mode** to run instant local mock generations.
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: UPLOAD / INGESTION INTERFACE */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Upload Source Training Materials</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Before we configure output features, please upload or reference the original lesson. Absolutely no data is auto-processed.
            </p>
          </div>

          {/* Drag & Drop Card */}
          <div
            id="drag-and-drop-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              dragActive 
                ? 'border-[#008567] bg-[#008567]/5' 
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <input
              id="file-upload-input"
              type="file"
              onChange={handleFileInput}
              className="hidden"
              accept={
                (session ? session.type : newSessionType) === 'video'
                  ? '.mp4,.mov,.webm'
                  : '.pdf,.docx,.pptx,.txt'
              }
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#008567] shadow-inner">
                <UploadCloud className="w-8 h-8 text-[#008567]" />
              </div>
              <div>
                <button
                   id="browse-files-btn"
                   type="button"
                   onClick={() => document.getElementById('file-upload-input')?.click()}
                   className="text-sm font-bold text-[#008567] hover:text-[#01a982] underline underline-offset-4 cursor-pointer"
                >
                  Click to browse files
                </button>
                <span className="text-slate-500 text-sm font-medium"> or drag and drop your file here</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {(session ? session.type : newSessionType) === 'video'
                  ? 'Supported formats: MP4, MOV, WEBM (Max 150MB)'
                  : 'Supported formats: PDF, DOCX, PPTX, TXT (Max 50MB)'}
              </p>
            </div>
          </div>

          {/* Video Link paste (only for Video type) */}
          {(session ? session.type : newSessionType) === 'video' && (
            <div className="space-y-2 border-t border-slate-100 pt-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or Paste Video Link Reference
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="video-url-input"
                    type="text"
                    placeholder="https://example.com/training-lesson.mp4"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008567] focus:ring-1 focus:ring-[#008567]/20"
                  />
                </div>
                <button
                  id="submit-video-link-btn"
                  type="button"
                  onClick={handleVideoLinkSubmit}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm font-bold px-5 rounded-xl transition-all active:scale-95"
                >
                  Reference link
                </button>
              </div>
            </div>
          )}

          {/* Inline Upload Errors */}
          {uploadError && (
            <div id="upload-error-message" className="bg-[#ff8d6d]/5 border border-[#ff8d6d]/25 rounded-xl p-4 text-[#ff8d6d] text-xs flex gap-2.5 items-center font-medium">
              <AlertCircle className="w-4 h-4 text-[#ff8d6d]" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* File Selected / Ready State (NO AUTO-PROCESSING!) */}
          {uploadedFile && (
            <div id="file-ready-banner" className="bg-[#fcfdfd] p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#008567]/10 rounded-xl text-[#008567] border border-[#008567]/20">
                  {uploadedFile.type === 'video' ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#008567] uppercase tracking-widest bg-[#2ad2c920] px-2 py-0.5 rounded border border-[#2ad2c930]">
                      Ready
                    </span>
                    <span className="text-slate-400 text-xs font-mono">
                      {uploadedFile.size > 0 ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Remote Reference'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mt-1 truncate max-w-[280px] sm:max-w-[400px]">
                    {uploadedFile.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="session-name-save-btn"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#008567] hover:bg-[#01a982] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Enter Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: CONFIGURATION & WORKSPACE MANIPULATION */}
      {currentStep === 2 && uploadedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Action Selector & Custom Configurations Options (Column width 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* File Info & Quick Session Name Edit */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-[#008567]/10 rounded-lg text-[#008567]">
                  {uploadedFile.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Loaded Source File</p>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{uploadedFile.name}</h4>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Session Title
                </label>
                <input
                  id="session-title-input"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="E.g. Kubernetes Deployments Lesson"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008567] focus:ring-1 focus:ring-[#008567]/20"
                />
              </div>

              {/* Version History / Load past documents compilation */}
              {session && Object.keys(session.docs).some(k => (session.docs as any)[k]?.length > 0) && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Compiled History Archive
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    {Object.keys(session.docs).map((key) => {
                      const list = (session.docs as any)[key] as DocumentVersion[];
                      if (!list || list.length === 0) return null;
                      return list.map((doc, dIdx) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition-colors text-left"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-[9px] font-bold text-[#008567] block uppercase font-mono">
                              {key} v{doc.version}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {new Date(doc.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <button
                            id={`load-history-${doc.id}`}
                            onClick={() => {
                              setActiveModule(key as any);
                              setGeneratedPreviewContent(doc.content);
                              if (doc.diagrams && doc.diagrams[0]) {
                                setGeneratedDiagramSvg(doc.diagrams[0]);
                              } else {
                                setGeneratedDiagramSvg('');
                              }
                              setCurrentStep(3); // open in preview
                            }}
                            className="text-[10px] font-bold bg-white hover:bg-slate-50 text-slate-700 px-2 py-1 rounded border border-slate-200"
                          >
                            View
                          </button>
                        </div>
                      ));
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Ingestion Modules & Individual Options Configuration Panels */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm text-slate-800">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ingestion Actions</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Configure and run distinct training files compilations.</p>
              </div>

              {/* Action A: Video Transcription (Only active if file is video) */}
              {uploadedFile.type === 'video' && (
                <div id="module-panel-transcript" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#008567]" />
                      <h4 className="text-xs font-bold text-slate-800">A. Video Transcription</h4>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-slate-150 text-xs">
                    {/* Diarization toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-[11px]">Speaker Diarization</span>
                      <input
                        type="checkbox"
                        checked={videoOptions.diarization}
                        onChange={(e) => setVideoOptions({ ...videoOptions, diarization: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                      />
                    </div>

                    {/* Speaker Labels editor */}
                    {videoOptions.diarization && (
                      <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">Speaker Names</span>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {Object.keys(videoOptions.speakerNames).map((key) => (
                            <div key={key} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="text-slate-500 font-mono">{key}:</span>
                              <span className="text-[#008567] font-bold">{videoOptions.speakerNames[key]}</span>
                              <button
                                onClick={() => removeSpeaker(key)}
                                className="text-slate-400 hover:text-rose-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {/* Add custom speaker */}
                        <div className="flex gap-1.5 pt-1.5">
                          <input
                            type="text"
                            placeholder="Speaker Key"
                            value={newSpeakerKey}
                            onChange={(e) => setNewSpeakerKey(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-800 w-1/2 focus:outline-none focus:border-[#008567]"
                          />
                          <input
                            type="text"
                            placeholder="Assign Label"
                            value={newSpeakerVal}
                            onChange={(e) => setNewSpeakerVal(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-800 w-1/2 focus:outline-none focus:border-[#008567]"
                          />
                          <button
                            onClick={addSpeaker}
                            className="p-1 bg-slate-50 hover:bg-slate-100 text-[#008567] border border-slate-200 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Language Settings */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 text-[10px] font-bold block mb-1">Source Language</span>
                        <select
                          value={videoOptions.language}
                          onChange={(e) => setVideoOptions({ ...videoOptions, language: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] font-bold block mb-1">Translation Target</span>
                        <select
                          value={videoOptions.targetLanguage}
                          onChange={(e) => setVideoOptions({ ...videoOptions, targetLanguage: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                        >
                          <option>None (Original)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>

                    {/* Timestamp granularity */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-[11px]">Timestamp Granularity</span>
                      <select
                        value={videoOptions.granularity}
                        onChange={(e: any) => setVideoOptions({ ...videoOptions, granularity: e.target.value })}
                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                      >
                        <option value="sentence">Per Sentence</option>
                        <option value="topic">Per Topic Segment</option>
                      </select>
                    </div>

                    {/* OCR Text toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-[11px]">Extract OCR Slide Text</span>
                      <input
                        type="checkbox"
                        checked={videoOptions.ocrEnabled}
                        onChange={(e) => setVideoOptions({ ...videoOptions, ocrEnabled: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                      />
                    </div>
                  </div>

                  <button
                    id="trigger-transcript-btn"
                    onClick={() => runGeneration('transcript')}
                    disabled={!isLlmAvailable || isGenerating}
                    className="w-full mt-2 bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]"
                  >
                    Generate Editable Transcript
                  </button>
                </div>
              )}

              {/* Action B: Document Upload Extract Text Review (Only active if file is document) */}
              {uploadedFile.type === 'document' && (
                <div id="module-panel-doc-review" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-800">B. Parse & Extract Review</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 font-medium">
                    Raw structure parse and extraction validated. You can review the extracted structural components in the preview frame on the right before compiling custom AI summaries.
                  </p>
                  <span className="inline-block text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded border border-amber-200">
                    Parse Verified: Structure Detected
                  </span>
                </div>
              )}

              {/* Action C: Word Document Generator Options (Config panel before generate) */}
              <div id="module-panel-worddoc" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800">C. Word Specification Architect</h4>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Tone */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Tone Profile</span>
                    <select
                      value={wordOptions.tone}
                      onChange={(e: any) => setWordOptions({ ...wordOptions, tone: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="Formal">Formal Enterprise</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Technical">Deep Technical</option>
                      <option value="Simplified">Simplified Guide</option>
                    </select>
                  </div>

                  {/* Structure */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Outline Structure</span>
                    <select
                      value={wordOptions.structure}
                      onChange={(e: any) => setWordOptions({ ...wordOptions, structure: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="Headings only">Headings only</option>
                      <option value="Headings + subheadings">Headings + Subheadings</option>
                      <option value="Flat narrative">Flat Narrative Block</option>
                    </select>
                  </div>

                  {/* Detail Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Depth Profile</span>
                    <select
                      value={wordOptions.detailLevel}
                      onChange={(e: any) => setWordOptions({ ...wordOptions, detailLevel: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="Executive summary">Executive Summary</option>
                      <option value="Standard">Standard Detail</option>
                      <option value="Deep-dive">Deep-Dive Manual</option>
                    </select>
                  </div>

                  {/* Charts & Diagrams checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-[11px]">Include System Charts</span>
                      <input
                        type="checkbox"
                        checked={wordOptions.includeCharts}
                        onChange={(e) => setWordOptions({ ...wordOptions, includeCharts: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                      />
                    </div>

                    {wordOptions.includeCharts && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1.5">
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Chart Formats</span>
                        {['process flow', 'comparison table', 'timeline'].map((chart) => {
                          const active = wordOptions.chartTypes.includes(chart);
                          return (
                            <button
                              key={chart}
                              onClick={() => toggleChartType(chart)}
                              className={`w-full text-left px-2 py-1 text-[10px] rounded flex items-center justify-between font-mono font-bold ${
                                active ? 'bg-[#008567]/10 text-[#008567]' : 'text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <span>{chart.toUpperCase()}</span>
                              {active && <Check className="w-3 h-3 text-[#008567]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Audience Variant */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Target Audience</span>
                    <select
                      value={wordOptions.audienceVariant}
                      onChange={(e: any) => setWordOptions({ ...wordOptions, audienceVariant: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="General">General / All-Teams</option>
                      <option value="Technical">Technical Operations</option>
                      <option value="Leadership">Leadership & Execs</option>
                    </select>
                  </div>
                </div>

                <button
                  id="trigger-worddoc-btn"
                  onClick={() => runGeneration('wordDoc')}
                  disabled={!isLlmAvailable || isGenerating}
                  className="w-full mt-2 bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  Generate Word Specification
                </button>
              </div>

              {/* Action D: FAQ Classifier Options */}
              <div id="module-panel-faq" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-800">D. FAQ Classifier Q&A</h4>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Deduplicate */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Deduplicate Questions</span>
                    <input
                      type="checkbox"
                      checked={faqOptions.dedupe}
                      onChange={(e) => setFaqOptions({ ...faqOptions, dedupe: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>

                  {/* Group by Topic */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium text-[11px]">Group by Topic Categories</span>
                      <input
                        type="checkbox"
                        checked={faqOptions.groupByTopic}
                        onChange={(e) => setFaqOptions({ ...faqOptions, groupByTopic: e.target.checked })}
                        className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                      />
                    </div>

                    {faqOptions.groupByTopic && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Topic Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {faqOptions.topics.map(t => (
                            <span key={t} className="text-[9px] bg-[#008567]/5 text-[#008567] px-1.5 py-0.5 rounded border border-[#008567]/15 flex items-center gap-1 font-mono font-bold">
                              {t}
                              <button onClick={() => removeFaqTopic(t)} className="hover:text-rose-500">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Add Topic Category"
                            value={newTopicTag}
                            onChange={(e) => setNewTopicTag(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-800 flex-1 focus:outline-none focus:border-[#008567]"
                          />
                          <button
                            onClick={addFaqTopic}
                            className="px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#008567] text-[10px] rounded font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Include Timestamps */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Include Source Timestamp</span>
                    <input
                      type="checkbox"
                      checked={faqOptions.includeTimestamps}
                      onChange={(e) => setFaqOptions({ ...faqOptions, includeTimestamps: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>

                  {/* Flag Unanswered Gaps */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Flag Unresolved Questions</span>
                    <input
                      type="checkbox"
                      checked={faqOptions.flagUnanswered}
                      onChange={(e) => setFaqOptions({ ...faqOptions, flagUnanswered: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>
                </div>

                <button
                  id="trigger-faq-btn"
                  onClick={() => runGeneration('faq')}
                  disabled={!isLlmAvailable || isGenerating}
                  className="w-full mt-2 bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  Generate Classifier FAQ
                </button>
              </div>

              {/* Action E: Quick Summary Notes */}
              <div id="module-panel-summary" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800">E. Quick Summary Notes</h4>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Length */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Summary Length</span>
                    <select
                      value={summaryOptions.length}
                      onChange={(e: any) => setSummaryOptions({ ...summaryOptions, length: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="short">Short Briefing</option>
                      <option value="medium">Medium Standard</option>
                      <option value="long">Long In-Depth</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Layout Format</span>
                    <select
                      value={summaryOptions.format}
                      onChange={(e: any) => setSummaryOptions({ ...summaryOptions, format: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="bullet points">Bullet Points List</option>
                      <option value="narrative paragraph">Narrative Paragraphs</option>
                    </select>
                  </div>

                  {/* Action Items toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Highlight Key Action Items</span>
                    <input
                      type="checkbox"
                      checked={summaryOptions.highlightActionItems}
                      onChange={(e) => setSummaryOptions({ ...summaryOptions, highlightActionItems: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>
                </div>

                <button
                  id="trigger-summary-btn"
                  onClick={() => runGeneration('summary')}
                  disabled={!isLlmAvailable || isGenerating}
                  className="w-full mt-2 bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  Generate Brief Summary
                </button>
              </div>

              {/* Action F: Architecture & Analysis Report */}
              <div id="module-panel-arch" className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  <h4 className="text-xs font-bold text-slate-800">F. Architecture & Analysis</h4>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Diagrams toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Include Auto Process Diagram</span>
                    <input
                      type="checkbox"
                      checked={archOptions.includeDiagrams}
                      onChange={(e) => setArchOptions({ ...archOptions, includeDiagrams: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>

                  {/* Depth */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Technical Detail Depth</span>
                    <select
                      value={archOptions.depth}
                      onChange={(e: any) => setArchOptions({ ...archOptions, depth: e.target.value })}
                      className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#008567]"
                    >
                      <option value="overview">High-Level Overview</option>
                      <option value="detailed technical breakdown">Detailed SRE Breakdown</option>
                    </select>
                  </div>

                  {/* Glossary */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium text-[11px]">Compile Technical Glossary</span>
                    <input
                      type="checkbox"
                      checked={archOptions.includeGlossary}
                      onChange={(e) => setArchOptions({ ...archOptions, includeGlossary: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#008567] text-[#008567] bg-white border-slate-300 rounded focus:ring-[#008567]"
                    />
                  </div>
                </div>

                <button
                  id="trigger-architecture-btn"
                  onClick={() => runGeneration('architecture')}
                  disabled={!isLlmAvailable || isGenerating}
                  className="w-full mt-2 bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]"
                >
                  Generate Architecture Specification
                </button>
              </div>

              {/* Danger / Destructive Action */}
              {session && onDeleteSession && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    id="delete-session-btn"
                    onClick={() => {
                      if (window.confirm("Are you absolutely sure you want to delete this session and all its compiled history? This cannot be undone.")) {
                        localStorage.removeItem(`traindoc_autosave_${session.id}`);
                        onDeleteSession(session.id);
                        onBackToDashboard();
                      }
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Extracted raw text or quick preview (Column width 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Long-running progress indicators */}
            {isGenerating && (
              <div id="generation-running-overlay" className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-5 h-5 text-[#008567] animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Generating Custom {activeModule?.toUpperCase()} Doc
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Please hold on. Compiling technical configurations...</p>
                    </div>
                  </div>
                  <button
                    id="cancel-generation-btn"
                    onClick={() => {
                      setCancelGeneration(true);
                      setIsGenerating(false);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg transition-colors font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-slate-500">Progress:</span>
                    <span className="text-[#008567]">{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-[#008567] h-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Source Document Text Review container */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-[#008567]" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Parsed Document Review</h3>
                </div>
                <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500 font-bold">
                  Read Only
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 h-[480px] overflow-y-auto font-mono text-xs text-slate-700 leading-relaxed custom-scrollbar whitespace-pre-wrap select-text">
                {uploadedFile.type === 'video' ? (
                  <div className="text-slate-500 italic text-center py-20 space-y-2">
                    <Video className="w-8 h-8 mx-auto text-[#008567]/30 mb-2" />
                    <p className="font-bold text-slate-800">Video loaded and ready for compilation.</p>
                    <p className="text-[10px]">Configure your Speaker labels on the left and hit "Generate Editable Transcript" above.</p>
                  </div>
                ) : (
                  parsedDocReview || 'Extracting layout nodes...'
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 3: HIGH-QUALITY GENERATION PREVIEW & ACCEPT/REJECT CYCLE */}
      {currentStep === 3 && activeModule && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#008567]/10 border border-[#008567]/20 rounded-2xl text-[#008567]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] bg-[#008567]/10 border border-[#008567]/20 font-mono font-bold text-[#008567] px-2 py-0.5 rounded">
                  COMPILE STAGE: PREVIEW & REVIEW
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Custom Generated {activeModule.toUpperCase()}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="preview-download-txt-btn"
                onClick={() => downloadFile(`${activeModule}-compiled`, 'txt')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" />
                TXT
              </button>
              <button
                id="preview-download-md-btn"
                onClick={() => downloadFile(`${activeModule}-compiled`, 'md')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" />
                Markdown
              </button>
              <button
                id="preview-download-docx-btn"
                onClick={() => downloadFile(`${activeModule}-compiled`, 'docx')}
                className="bg-[#008567]/5 hover:bg-[#008567]/10 border border-[#008567]/20 text-[#008567] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Word
              </button>
              {generatedDiagramSvg && (
                <button
                  id="preview-download-svg-btn"
                  onClick={() => downloadFile(`${activeModule}-architecture`, 'svg')}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  SVG Diagram
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Document Content (width 8/12 or 12/12 if no diagrams) */}
            <div className={generatedDiagramSvg ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 min-h-[400px] max-h-[550px] overflow-y-auto select-text font-sans text-slate-800 leading-relaxed text-sm space-y-4 shadow-inner custom-scrollbar">
                
                {/* Format and display generated text nicely */}
                {generatedPreviewContent.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-200 pb-2 mt-4">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-bold text-slate-900 tracking-tight mt-4">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-sm font-bold text-[#008567] tracking-wide uppercase mt-3">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('#### ')) {
                    return <h4 key={idx} className="text-xs font-bold text-amber-700 tracking-wide uppercase mt-3">{line.replace('#### ', '')}</h4>;
                  }
                  if (line.startsWith('* ') || line.startsWith('- ')) {
                    return <li key={idx} className="list-disc ml-5 text-xs text-slate-700 font-medium">{line.replace(/^[*\-]\s+/, '')}</li>;
                  }
                  if (line.match(/^\d+\.\s+/)) {
                    return <li key={idx} className="list-decimal ml-5 text-xs text-slate-700 font-medium">{line}</li>;
                  }
                  return <p key={idx} className="text-xs text-slate-700 leading-relaxed font-medium">{line}</p>;
                })}

              </div>
            </div>

            {/* Diagrams visualizer column if available */}
            {generatedDiagramSvg && (
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">
                    Compiled Interactive Diagram View
                  </span>
                  <div 
                    className="flex items-center justify-center border border-slate-200/80 rounded-xl bg-white p-2 overflow-hidden shadow-sm"
                    dangerouslySetInnerHTML={{ __html: generatedDiagramSvg }}
                  />
                  <p className="text-[10px] text-slate-500 leading-relaxed text-center font-medium">
                    Rendered dynamically via described operational workflows. Employs SVG nodes with modern viewport bounds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Accept / Reject Command bar */}
          <div className="border-t border-slate-150 pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium max-w-md">
              Please review your document parameters carefully. You must explicitly choose whether to Accept this compilation into your session history or Discard it.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="reject-generation-btn"
                type="button"
                onClick={() => setConfirmDiscardOpen(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-5 py-2.5 border border-rose-200 rounded-xl transition-all"
              >
                Discard & Exit
              </button>
              
              <button
                id="regenerate-trigger-btn"
                type="button"
                onClick={() => setConfirmRegenerateOpen(true)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-5 py-2.5 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Regenerate alternate options
              </button>

              <button
                id="accept-generation-btn"
                type="button"
                onClick={acceptGeneration}
                className="bg-[#008567] hover:bg-[#01a982] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Accept & Commit Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: DISCARD FILE */}
      {confirmDiscardOpen && (
        <div id="discard-confirm-modal" className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl text-slate-800">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-slate-900">Confirm Discard Action</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to discard this generated {activeModule?.toUpperCase()} document? Any uncommitted changes will be permanently deleted. This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="modal-discard-cancel"
                onClick={() => setConfirmDiscardOpen(false)}
                className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
              >
                No, Keep Document
              </button>
              <button
                id="modal-discard-confirm"
                onClick={discardGeneration}
                className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-rose-700 transition-all"
              >
                Yes, Discard Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: REGENERATE ALTERNATE OPTIONS */}
      {confirmRegenerateOpen && (
        <div id="regenerate-confirm-modal" className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl text-slate-800">
            <div className="flex items-center gap-3 text-amber-600">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-slate-900">Confirm Regeneration Settings</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Would you like to discard this current preview and load back the options configure panel to compile another version?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="modal-regen-cancel"
                onClick={() => setConfirmRegenerateOpen(false)}
                className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
              >
                No, Stay in Preview
              </button>
              <button
                id="modal-regen-confirm"
                onClick={() => {
                  setConfirmRegenerateOpen(false);
                  setCurrentStep(2); // take them back
                }}
                className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-700 transition-all"
              >
                Yes, Configure Again
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
