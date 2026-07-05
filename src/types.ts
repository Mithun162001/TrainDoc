export type LLMProvider = 'sandbox' | 'ollama' | 'gemini';

export interface LLMConfig {
  provider: LLMProvider;
  endpoint: string;
  model: string;
  clientSideDirect: boolean;
}

export type FileType = 'video' | 'document';

export interface UploadedFile {
  name: string;
  size: number;
  type: FileType;
  rawText?: string; // For parsed documents
  videoUrl?: string; // For video links
}

export interface VideoOptions {
  diarization: boolean;
  speakerNames: { [key: string]: string }; // e.g. "Speaker 1": "Trainer", "Speaker 2": "User"
  language: string;
  targetLanguage: string;
  granularity: 'sentence' | 'topic';
  ocrEnabled: boolean;
}

export interface DocGenOptions {
  tone: 'Formal' | 'Conversational' | 'Technical' | 'Simplified';
  structure: 'Headings only' | 'Headings + subheadings' | 'Flat narrative';
  detailLevel: 'Executive summary' | 'Standard' | 'Deep-dive';
  includeCharts: boolean;
  chartTypes: string[]; // e.g., ['process flow', 'comparison table', 'timeline']
  audienceVariant: 'General' | 'Technical' | 'Leadership';
}

export interface FAQOptions {
  dedupe: boolean;
  groupByTopic: boolean;
  topics: string[];
  includeTimestamps: boolean;
  flagUnanswered: boolean;
}

export interface SummaryOptions {
  length: 'short' | 'medium' | 'long';
  format: 'bullet points' | 'narrative paragraph';
  highlightActionItems: boolean;
}

export interface ArchOptions {
  includeDiagrams: boolean;
  depth: 'overview' | 'detailed technical breakdown';
  includeGlossary: boolean;
}

export interface DocumentVersion {
  id: string;
  version: number;
  timestamp: string;
  title: string;
  content: string;
  diagrams?: string[]; // Flowchart descriptions or SVG strings
  configSnapshot: any;
}

export interface GeneratedDocs {
  transcript?: DocumentVersion[];
  summary?: DocumentVersion[];
  faq?: DocumentVersion[];
  architectureReport?: DocumentVersion[];
  wordDoc?: DocumentVersion[];
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  type: FileType;
  file: UploadedFile;
  docs: GeneratedDocs;
  topic?: string;
}
