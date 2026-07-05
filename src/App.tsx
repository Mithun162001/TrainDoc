import React, { useState, useEffect } from 'react';
import { Session, LLMConfig, FileType } from './types';
import Dashboard from './components/Dashboard';
import ModelSettings from './components/ModelSettings';
import SessionWorkspace from './components/SessionWorkspace';
import { 
  FolderLock, 
  Settings2, 
  LayoutDashboard, 
  Info,
  Server,
  CloudLightning,
  Workflow
} from 'lucide-react';

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'session-k8s',
    name: 'Kubernetes Pod Scaling Lesson',
    createdAt: '2026-07-04T10:30:00.000Z',
    type: 'video',
    topic: 'Kubernetes & Container Orchestration',
    file: {
      name: 'k8s-pod-scaling-on-demand.mp4',
      size: 45 * 1024 * 1024,
      type: 'video'
    },
    docs: {
      transcript: [
        {
          id: 'k8s-t1',
          version: 1,
          timestamp: '2026-07-04T10:32:00.000Z',
          title: 'Initial Diarized Transcript',
          content: `[00:15] **Trainer**: Welcome everyone to our technical dive into Kubernetes deployments. Today we are setting up highly available pods and talking about container lifecycle hooks.
[01:10] **Trainer**: Now, when we specify a Deployment, we have replicas. If one pod fails, the ReplicaSet ensures a new one replaces it. Any questions so far?
[01:35] **Participant**: Yes, does the ReplicaSet reschedule pods on different worker nodes if a node itself goes down completely?
[02:00] **Trainer**: Absolutely! The control plane detects NodeLost and schedules the remaining replicas on the healthy nodes.
[03:15] **Trainer**: Let us configure our YAML. We define resources, requests, and limits. Requests are what the pod is guaranteed; limits are the hard ceilings.
[04:10] **Participant**: What happens if a container goes beyond its memory limit? Does it get throttled or killed?
[04:30] **Trainer**: Memory is non-compressible, so it gets OOMKilled. CPU can be throttled because it is compressible. That is a vital distinction.`,
          configSnapshot: { diarization: true, speakerNames: { 'Speaker 1': 'Trainer', 'Speaker 2': 'Participant' } }
        }
      ],
      summary: [
        {
          id: 'k8s-s1',
          version: 1,
          timestamp: '2026-07-04T10:35:00.000Z',
          title: 'Standard Summary Briefing',
          content: `### Executive Briefing: Kubernetes & Container Orchestration

* **Primary Goal**: Training session covering best practices, structural configurations, and escalation pipelines.
* **Operational Strategy**: Prioritize quality, error-avoidance, and strict compliance over speed.
* **Resource Scheduling**: Ensure guaranteed memory/CPU thresholds are explicitly declared to prevent resource exhaustion.
* **Escalation Guidelines**: SLA breaches should be escalated to SRE leads immediately with no delay.

#### ⚡ Key Action Items:
1. **[ACTION]** Review and align local staging environment values to production parameters immediately.
2. **[ACTION]** Update SLA escalation directory in team Slack channels.
3. **[ACTION]** Set resource request and limit configurations in all current system manifests.`,
          configSnapshot: { length: 'medium', format: 'bullet points', highlightActionItems: true }
        }
      ],
      faq: [
        {
          id: 'k8s-f1',
          version: 1,
          timestamp: '2026-07-04T10:40:00.000Z',
          title: 'FAQ Classification Sheet',
          content: `## ❓ Frequent Questions & Answers: Kubernetes & Container Orchestration

### Topic: Core Overview

**Q: What is the main objective of this training module?**
*A: To align technical and operational teams on deploying and maintaining highly resilient services under Kubernetes & Container Orchestration.*
_Source timestamp: [00:15]_ 

### Topic: Resource Management

**Q: How should we handle system resource exhaustion or throttling?**
*A: Configure precise CPU/Memory resource requests. CPU will throttle on limits, but exceeding memory limits causes an immediate OOMKill.*
_Source timestamp: [04:30]_ `,
          configSnapshot: { dedupe: true, groupByTopic: true, includeTimestamps: true }
        }
      ],
      architectureReport: [
        {
          id: 'k8s-a1',
          version: 1,
          timestamp: '2026-07-04T10:45:00.000Z',
          title: 'Architecture Specification V1',
          content: `# 📋 System Architecture & Analysis Report
**Target Topic**: Kubernetes & Container Orchestration
**Evaluation Depth**: Deep technical assessment

## 1. Executive Structural Analysis
The operations described in the training source present a multi-layered infrastructure. This layer relies heavily on automated health probes, isolated configuration matrices, and clear routing handshakes. Under peak operations, the ingestion gateway requires load balancing configured with sticky sessions.

## 2. Interactive System Process Diagram
Below is the auto-generated process and routing flowchart representing the documented architecture:

*(See visual interactive flowchart in the dashboard preview tab)*`,
          diagrams: [
            `<svg viewBox="0 0 600 240" class="w-full h-auto bg-slate-900 rounded-xl p-4 border border-slate-700 font-sans shadow-lg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2ad2c9" />
                </marker>
                <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#008567" />
                  <stop offset="100%" stop-color="#01a982" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1e293b" />
                  <stop offset="100%" stop-color="#0f172a" />
                </linearGradient>
              </defs>
              <text x="300" y="25" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">K8S SCALING SEQUENCE</text>
              <rect x="20" y="70" width="120" height="60" rx="8" fill="url(#blueGrad)" stroke="#5f7a76" stroke-width="2" />
              <text x="80" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">1. CPU Spike</text>
              <text x="80" y="115" fill="#ff8d6d" font-size="10" text-anchor="middle">&gt; 80% limit</text>
              <path d="M 140 100 L 210 100" fill="none" stroke="#2ad2c9" stroke-width="2" marker-end="url(#arrow)" />
              <rect x="220" y="70" width="140" height="60" rx="8" fill="url(#boxGrad)" stroke="#2ad2c9" stroke-width="1.5" />
              <text x="290" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">2. ReplicaSet Trigger</text>
              <text x="290" y="115" fill="#ffffff" font-size="10" text-anchor="middle">Spawn new pods</text>
              <path d="M 360 100 L 430 100" fill="none" stroke="#2ad2c9" stroke-width="2" marker-end="url(#arrow)" />
              <rect x="440" y="70" width="140" height="60" rx="8" fill="url(#blueGrad)" stroke="#5f7a76" stroke-width="2" />
              <text x="510" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">3. Load Balance</text>
              <text x="510" y="115" fill="#2ad2c9" font-size="10" text-anchor="middle">Even routing</text>
            </svg>`
          ],
          configSnapshot: { includeDiagrams: true, depth: 'detailed technical breakdown', includeGlossary: true }
        }
      ]
    }
  },
  {
    id: 'session-support',
    name: 'Customer Support Escalation Onboarding',
    createdAt: '2026-07-03T16:00:00.000Z',
    type: 'document',
    topic: 'Customer Operations & Success Training',
    file: {
      name: 'support_onboarding_SOP.docx',
      size: 1.2 * 1024 * 1024,
      type: 'document',
      rawText: `--- EXTRACTED LAYOUT FOR SUPPORT_ONBOARDING_SOP.DOCX ---
      
[Header Node]: Onboarding SOP
[Section 1]: SLA Breach & Live Chat escalations.
 - In case of 15 minutes left on SLA, ping support leads on Slack.
 - First Contact Resolution (FCR) targets established at 85%.`
    },
    docs: {
      summary: [
        {
          id: 'support-s1',
          version: 1,
          timestamp: '2026-07-03T16:05:00.000Z',
          title: 'SOP Quick Summary Notes',
          content: `### Briefing Narrative: Customer Operations & Success Training

This professional training session provided an in-depth operational walkthrough on Customer Operations & Success Training. The trainer emphasized that setting precise SLA guardrails is essential for customer trust. 

During the onboarding modules, the focus centered around the crucial escalation pathway. Any impending SLA breaches must trigger immediate lead-level notifications on Slack rather than standard slow ticketing handovers.`,
          configSnapshot: { length: 'medium', format: 'narrative paragraph', highlightActionItems: false }
        }
      ]
    }
  }
];

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'workspace' | 'settings'>('dashboard');
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'sandbox',
    endpoint: 'http://localhost:11434',
    model: 'llama3',
    clientSideDirect: true
  });
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [newSessionType, setNewSessionType] = useState<FileType | null>(null);

  // Sync to local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem('traindoc_sessions_v1');
    const savedConfig = localStorage.getItem('traindoc_llm_config_v1');

    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch {
        setSessions(INITIAL_SESSIONS);
      }
    } else {
      setSessions(INITIAL_SESSIONS);
    }

    if (savedConfig) {
      try {
        setLlmConfig(JSON.parse(savedConfig));
      } catch {
        // use default
      }
    }
  }, []);

  const saveSessionsToStorage = (updatedList: Session[]) => {
    setSessions(updatedList);
    localStorage.setItem('traindoc_sessions_v1', JSON.stringify(updatedList));
  };

  const saveConfigToStorage = (updatedConfig: LLMConfig) => {
    setLlmConfig(updatedConfig);
    localStorage.setItem('traindoc_llm_config_v1', JSON.stringify(updatedConfig));
  };

  // Select existing session
  const selectSession = (session: Session) => {
    setActiveSession(session);
    setNewSessionType(null);
    setActiveView('workspace');
  };

  // Launch fresh ingestion
  const startNewSession = (type: FileType) => {
    setActiveSession(null);
    setNewSessionType(type);
    setActiveView('workspace');
  };

  // Save session edits/appends
  const saveSession = (updatedSession: Session) => {
    const idx = sessions.findIndex((s) => s.id === updatedSession.id);
    let newList;
    if (idx >= 0) {
      newList = [...sessions];
      newList[idx] = updatedSession;
    } else {
      newList = [updatedSession, ...sessions];
    }
    saveSessionsToStorage(newList);
    setActiveSession(updatedSession); // keep active session updated
  };

  // Delete session
  const deleteSession = (sessionId: string) => {
    const newList = sessions.filter((s) => s.id !== sessionId);
    saveSessionsToStorage(newList);
    localStorage.removeItem(`traindoc_autosave_${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-800 antialiased flex flex-col selection:bg-[#008567]/10 selection:text-[#008567]">
      
      {/* Sleek, Sticky Global Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => {
              setActiveView('dashboard');
              setActiveSession(null);
              setNewSessionType(null);
            }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008567] to-[#2ad2c9] flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Train<span className="text-[#008567]">Doc</span>
              </span>
              <p className="text-[9px] text-[#5f7a76] font-bold tracking-wider font-mono">WORKSPACE</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-dashboard-tab"
              onClick={() => {
                setActiveView('dashboard');
                setActiveSession(null);
                setNewSessionType(null);
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                activeView === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Workspace
            </button>
            <button
              id="nav-settings-tab"
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                activeView === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Model Provider
            </button>
          </nav>

          {/* Ingress status badge */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            {llmConfig.provider === 'sandbox' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#2ad2c9]" />
                <span className="text-[10px] font-mono font-bold text-slate-600">SANDBOX VERIFIED</span>
              </>
            ) : llmConfig.provider === 'gemini' ? (
              <>
                <CloudLightning className="w-3.5 h-3.5 text-[#008567]" />
                <span className="text-[10px] font-mono font-bold text-[#008567]">GEMINI CLOUD</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 text-[#5f7a76]" />
                <span className="text-[10px] font-mono font-bold text-[#5f7a76] truncate max-w-[120px]">
                  OLLAMA: {llmConfig.model}
                </span>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Main View Grid Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {activeView === 'dashboard' && (
          <Dashboard 
            sessions={sessions}
            onSelectSession={selectSession}
            onStartNewSession={startNewSession}
          />
        )}

        {activeView === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <ModelSettings 
              config={llmConfig}
              onChange={saveConfigToStorage}
            />
            {/* Helpful guidelines for user */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Info className="w-4 h-4 text-[#008567]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">How to connect local Ollama (Llama 3)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                By default, TrainDoc includes a built-in **Sandbox Simulator** that instantly runs highly relevant training document compiles. However, TrainDoc is engineered as a model-agnostic workspace. To connect a live, local Llama 3 instance:
              </p>
              <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1.5">
                <li>Install and start Ollama on your machine (`ollama serve`).</li>
                <li>Download your preferred model (`ollama run llama3`).</li>
                <li>Set TrainDoc Settings to **Ollama (Llama 3)** and turn on **Client-Side Direct Mode** so the browser bypasses remote sandbox container limits to connect directly.</li>
                <li>Ensure CORS origins in your Ollama environment are configured to allow requests by launching Ollama in terminal with `OLLAMA_ORIGINS="*"`.</li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'workspace' && (
          <SessionWorkspace 
            session={activeSession}
            newSessionType={newSessionType}
            llmConfig={llmConfig}
            onBackToDashboard={() => {
              setActiveView('dashboard');
              setActiveSession(null);
              setNewSessionType(null);
            }}
            onSaveSession={saveSession}
            onDeleteSession={deleteSession}
          />
        )}

      </main>

      {/* Minimal Aesthetic Margin Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TrainDoc. Designed for user-controlled training compliance.</p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              UTC TIME: 2026-07-05
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
