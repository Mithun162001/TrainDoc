import { VideoOptions, DocGenOptions, FAQOptions, SummaryOptions, ArchOptions } from './types';

// Helper to extract keywords from title to make mock output highly relevant
export function determineTopic(name: string): string {
  const lowercase = name.toLowerCase();
  if (lowercase.includes('k8s') || lowercase.includes('kubernetes') || lowercase.includes('docker') || lowercase.includes('deploy')) {
    return 'Kubernetes & Container Orchestration';
  }
  if (lowercase.includes('sales') || lowercase.includes('customer') || lowercase.includes('support') || lowercase.includes('onboarding')) {
    return 'Customer Operations & Success Training';
  }
  if (lowercase.includes('security') || lowercase.includes('compliance') || lowercase.includes('gdpr') || lowercase.includes('iso')) {
    return 'Corporate Security & Compliance Guidelines';
  }
  if (lowercase.includes('git') || lowercase.includes('code') || lowercase.includes('ci') || lowercase.includes('cd') || lowercase.includes('pipeline')) {
    return 'CI/CD Pipelines & Developer Workflows';
  }
  return 'General Technical Architecture & Operations';
}

export function generateMockTranscript(filename: string, options: VideoOptions): string {
  const topic = determineTopic(filename);
  const trainer = options.speakerNames['Speaker 1'] || 'Trainer';
  const attendee = options.speakerNames['Speaker 2'] || 'Participant';

  let lines: string[] = [];
  const addLine = (time: string, speaker: string, text: string) => {
    if (options.diarization) {
      lines.push(`[${time}] **${speaker}**: ${text}`);
    } else {
      lines.push(`[${time}] ${text}`);
    }
  };

  const addOcr = (time: string, text: string) => {
    if (options.ocrEnabled) {
      lines.push(`\n[${time}] *[On-screen text]*:\n>>> ${text}\n`);
    }
  };

  if (topic.includes('Kubernetes')) {
    addLine('00:15', trainer, 'Welcome everyone to our technical dive into Kubernetes deployments. Today we are setting up highly available pods and talking about container lifecycle hooks.');
    addOcr('00:45', 'SLIDE 1: Kubernetes Core Components\n- API Server\n- Kubelet\n- Control Plane Architecture\n- Pod Specifications');
    addLine('01:10', trainer, 'Now, when we specify a Deployment, we have replicas. If one pod fails, the ReplicaSet ensures a new one replaces it. Any questions so far?');
    addLine('01:35', attendee, 'Yes, does the ReplicaSet reschedule pods on different worker nodes if a node itself goes down completely?');
    addLine('02:00', trainer, 'Absolutely! The control plane detects NodeLost and schedules the remaining replicas on the healthy nodes.');
    addOcr('02:30', 'DIAGRAM: Pod Scheduling Sequence\nScheduler -> Kubelet -> Container Runtime -> Running Pod');
    addLine('03:15', trainer, 'Let us configure our YAML. We define resources, requests, and limits. Requests are what the pod is guaranteed; limits are the hard ceilings.');
    addLine('04:10', attendee, 'What happens if a container goes beyond its memory limit? Does it get throttled or killed?');
    addLine('04:30', trainer, 'Memory is non-compressible, so it gets OOMKilled. CPU can be throttled because it is compressible. That is a vital distinction.');
  } else if (topic.includes('Customer')) {
    addLine('00:10', trainer, 'Hello and welcome. In this onboarding session, we are going to walk through our ticket escalation matrix and live chat guidelines.');
    addOcr('00:35', 'SLIDE 1: Support Core Pillars\n1. Empathetic Listening\n2. First Contact Resolution (FCR)\n3. Tier-based Escalation');
    addLine('01:05', trainer, 'Our goal is always empathetic resolution. If a customer is frustrated, validate their concern first. Never respond with raw policy blocks immediately.');
    addLine('01:50', attendee, 'How do we handle SLA breaches? If a Tier 2 engineer is not responding, do we ping the manager or wait?');
    addLine('02:20', trainer, 'If there is only 15 minutes left on the SLA, immediately escalate to the support lead on Slack. Do not wait for standard ticket handovers.');
    addOcr('03:10', 'FLOWCHART: Live Chat Path\nCustomer Ping -> Automated Routing -> Agent Assigned -> Resolution/Escalation');
    addLine('04:00', trainer, 'Excellent. Let us review some canned responses. Remember, customize them! Do not copy-paste blindly.');
  } else {
    // Generic high-quality technical transcript
    addLine('00:15', trainer, `Good morning. Let us start our training session focusing on ${topic}. We will review the key procedures and operational standards.`);
    addOcr('00:50', `SESSION MODULES:\n- Introduction & Objective\n- Standard Operating Procedure (SOP)\n- Risk Analysis & Failure Modes\n- Action Items & Next Steps`);
    addLine('01:30', trainer, 'Each team member must fully understand their assigned components before deployment. Accuracy is far more critical than speed.');
    addLine('02:10', attendee, 'Are there any pre-requisite configurations or system checks we need to perform before launching this module?');
    addLine('02:40', trainer, 'Yes, verify your access tokens and make sure your staging environmental configuration matches our production values.');
    addOcr('03:20', 'SYSTEM OVERVIEW ARCHITECTURE DIAGRAM\nClient Ingress -> Application API Gateway -> Secured Services Container');
    addLine('04:15', trainer, 'Keep an eye on the audit logs. Every major change is recorded. If anything behaves unexpectedly, freeze the release and notify the lead.');
  }

  if (options.granularity === 'topic') {
    // Group into topic headers
    let groupedLines: string[] = [];
    groupedLines.push('### Topic Segment 1: Session Kickoff & Core Definitions');
    groupedLines.push(...lines.slice(0, Math.floor(lines.length / 2)));
    groupedLines.push('\n### Topic Segment 2: Interactive Q&A and Deep Dive Analysis');
    groupedLines.push(...lines.slice(Math.floor(lines.length / 2)));
    return groupedLines.join('\n');
  }

  return lines.join('\n');
}

export function generateMockSummary(filename: string, options: SummaryOptions): string {
  const topic = determineTopic(filename);
  let summary = '';

  if (options.format === 'bullet points') {
    summary += `### Executive Briefing: ${topic}\n\n`;
    summary += `* **Primary Goal**: Training session covering best practices, structural configurations, and escalation pipelines.\n`;
    summary += `* **Operational Strategy**: Prioritize quality, error-avoidance, and strict compliance over speed.\n`;
    if (options.length === 'short') {
      summary += `* **Key takeaway**: Core workflows must be validated in staging before production sync.\n`;
    } else {
      summary += `* **Resource Scheduling**: Ensure guaranteed memory/CPU thresholds are explicitly declared to prevent resource exhaustion.\n`;
      summary += `* **Escalation Guidelines**: SLA breaches should be escalated to leads immediately with no delay.\n`;
      summary += `* **Team Coordination**: Maintain clean communication logs and audit logs for architectural consistency.\n`;
    }
  } else {
    summary += `### Briefing Narrative: ${topic}\n\n`;
    summary += `This professional training session provided an in-depth operational walkthrough on ${topic}. `;
    summary += `The trainer emphasized that setting precise guardrails is essential for system stability. `;
    if (options.length !== 'short') {
      summary += `During the interactive segment, participant questions surfaced the critical importance of understanding compressible vs non-compressible resources. Under high stress, failure to allocate proper limits can cause immediate outages. `;
      summary += `The session concluded with an actionable guide on resolving system anomalies, ticket handovers, and SLA workflows, ensuring all team members are fully aligned on escalation procedures.`;
    } else {
      summary += `Key areas discussed include pod specs, resource thresholds, SLA paths, and proactive escalation.`;
    }
  }

  if (options.highlightActionItems) {
    summary += `\n\n#### ⚡ Key Action Items:\n`;
    summary += `1. **[ACTION]** Review and align local staging environment values to production parameters immediately.\n`;
    summary += `2. **[ACTION]** Update SLA escalation directory in team Slack channels.\n`;
    summary += `3. **[ACTION]** Set resource request and limit configurations in all current system manifests.`;
  }

  return summary;
}

export function generateMockFAQ(filename: string, options: FAQOptions): string {
  const topic = determineTopic(filename);
  let faq = `## ❓ Frequent Questions & Answers: ${topic}\n\n`;

  const items = [
    {
      q: 'What is the main objective of this training module?',
      a: `To align technical and operational teams on deploying and maintaining highly resilient services under ${topic}.`,
      cat: 'Core Overview',
      ts: '00:15'
    },
    {
      q: 'How should we handle system resource exhaustion or throttling?',
      a: 'Configure precise CPU/Memory resource requests. CPU will throttle on limits, but exceeding memory limits causes an immediate OOMKill.',
      cat: 'Resource Management',
      ts: '04:30'
    },
    {
      q: 'Who should be contacted in case of an imminent SLA breach?',
      a: 'Escalate directly to the support lead via dedicated Slack channels rather than waiting for standard handovers.',
      cat: 'Operational Escalations',
      ts: '02:20'
    },
    {
      q: 'Where do we find the staging parameters to mirror production?',
      a: 'All configuration files are secured and stored inside the centralized team environment repository.',
      cat: 'Resource Management',
      ts: '03:15'
    }
  ];

  let filtered = items;
  if (options.dedupe) {
    // Skip duplicate/similar questions simulated
    filtered = items.slice(0, 3);
  }

  if (options.groupByTopic) {
    // Group them
    const groups: { [key: string]: typeof items } = {};
    options.topics.forEach(t => groups[t] = []);
    
    // Fallback categories if topics empty
    const actualTopics = options.topics.length > 0 ? options.topics : ['General Support', 'Technical Infrastructure', 'Compliance'];
    actualTopics.forEach(t => {
      groups[t] = [];
    });

    filtered.forEach(item => {
      // Simple match
      let assigned = false;
      actualTopics.forEach(t => {
        if (!assigned && (item.cat.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(item.cat.toLowerCase()))) {
          groups[t].push(item);
          assigned = true;
        }
      });
      if (!assigned) {
        // assign to first
        groups[actualTopics[0]].push(item);
      }
    });

    Object.keys(groups).forEach(cat => {
      if (groups[cat].length > 0) {
        faq += `### Topic: ${cat}\n\n`;
        groups[cat].forEach(item => {
          faq += `**Q: ${item.q}**\n`;
          faq += `*A: ${item.a}*\n`;
          if (options.includeTimestamps) {
            faq += `_Source timestamp: [${item.ts}]_ \n`;
          }
          faq += `\n`;
        });
      }
    });
  } else {
    filtered.forEach((item, idx) => {
      faq += `### Q${idx + 1}: ${item.q}\n`;
      faq += `*A: ${item.a}*\n`;
      if (options.includeTimestamps) {
        faq += `_Source timestamp: [${item.ts}]_ \n`;
      }
      faq += `\n`;
    });
  }

  if (options.flagUnanswered) {
    faq += `\n---\n### ⚠️ Flagged Gaps (Unresolved / Poorly Answered):\n`;
    faq += `1. **Question**: "Does the automated backup service sync immediately during peak traffic?"\n`;
    faq += `   - *Reason for flag*: Trainer noted this is team-specific and needs offline verification. Action item pending.`;
  }

  return faq;
}

export function generateMockArchitectureReport(filename: string, options: ArchOptions): { content: string, diagramSvg: string } {
  const topic = determineTopic(filename);
  let content = `# 📋 System Architecture & Analysis Report\n`;
  content += `**Target Topic**: ${topic}\n`;
  content += `**Evaluation Depth**: ${options.depth === 'detailed technical breakdown' ? 'Deep technical assessment' : 'High-level architectural overview'}\n\n`;

  content += `## 1. Executive Structural Analysis\n`;
  content += `The operations described in the training source present a multi-layered infrastructure. `;
  content += `This layer relies heavily on automated health probes, isolated configuration matrices, and clear routing handshakes. `;
  
  if (options.depth === 'detailed technical breakdown') {
    content += `Under peak operations, the ingestion gateway requires load balancing configured with sticky sessions. `;
    content += `The core state is monitored via prometheus metrics that alert on 80% thread pool exhaustion. `;
    content += `All database connections are pooled, with a maximum lifetime of 30 minutes to recycle orphaned resources. `;
  } else {
    content += `This system relies on client-side requests routed through an API Gateway to decoupled back-end services.`;
  }

  let diagramSvg = '';
  if (options.includeDiagrams) {
    content += `\n\n## 2. Interactive System Process Diagram\n`;
    content += `Below is the auto-generated process and routing flowchart representing the documented architecture:\n\n`;
    content += `*(See visual interactive flowchart in the dashboard preview tab)*\n\n`;
    
    // Let's design a beautiful SVG diagram to embed
    diagramSvg = `
<svg viewBox="0 0 600 240" class="w-full h-auto bg-slate-900 rounded-xl p-4 border border-slate-700 font-sans shadow-lg">
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

  <!-- Title -->
  <text x="300" y="25" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="1">SYSTEM FLOW diagram</text>

  <!-- Step 1 -->
  <rect x="20" y="70" width="120" height="60" rx="8" fill="url(#blueGrad)" stroke="#5f7a76" stroke-width="2" />
  <text x="80" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">1. Source Ingestion</text>
  <text x="80" y="115" fill="#ff8d6d" font-size="10" text-anchor="middle">Client Data / Link</text>

  <!-- Arrow 1 to 2 -->
  <path d="M 140 100 L 210 100" fill="none" stroke="#2ad2c9" stroke-width="2" marker-end="url(#arrow)" />

  <!-- Step 2 -->
  <rect x="220" y="70" width="140" height="60" rx="8" fill="url(#boxGrad)" stroke="#2ad2c9" stroke-width="1.5" />
  <text x="290" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">2. Abstracted LLM Layer</text>
  <text x="290" y="115" fill="#ffffff" font-size="10" text-anchor="middle">Configure options</text>

  <!-- Arrow 2 to 3 -->
  <path d="M 360 100 L 430 100" fill="none" stroke="#2ad2c9" stroke-width="2" marker-end="url(#arrow)" />

  <!-- Step 3 -->
  <rect x="440" y="70" width="140" height="60" rx="8" fill="url(#blueGrad)" stroke="#5f7a76" stroke-width="2" />
  <text x="510" y="95" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">3. Doc Compilation</text>
  <text x="510" y="115" fill="#2ad2c9" font-size="10" text-anchor="middle">Word / MD Format</text>

  <!-- Flow Notes -->
  <rect x="180" y="165" width="240" height="40" rx="4" fill="#0f172a" stroke="#008567" stroke-width="1" />
  <text x="300" y="180" fill="#2ad2c9" font-size="10" font-weight="bold" text-anchor="middle">ACTIVE CONFIGURATION PROFILES</text>
  <text x="300" y="196" fill="#a1a1aa" font-size="9" text-anchor="middle">Structured heading hierarchy with custom SLA paths</text>
</svg>
`;
  }

  if (options.includeGlossary) {
    content += `\n\n## 3. Operational Glossary\n`;
    content += `* **OOMKilled**: Out Of Memory termination, a container state indicating resource limits were violated.\n`;
    content += `* **SLA Handover**: A service level agreement transfer process ensuring task continuity across engineering tiers.\n`;
    content += `* **Diarization**: The process of separating an audio stream into distinct speaker labels.\n`;
    content += `* **Abstracted Ingestion**: Standardized file structure reading prior to passing coordinates to any LLM engine.`;
  }

  return { content, diagramSvg };
}

export function generateMockWordDocument(filename: string, options: DocGenOptions): string {
  const topic = determineTopic(filename);
  let doc = `# 📄 Generated Word Specification: ${topic}\n`;
  doc += `**Tone Style**: ${options.tone} | **Audience Variant**: ${options.audienceVariant} | **Detail Profile**: ${options.detailLevel}\n\n`;

  if (options.structure === 'Headings only') {
    doc += `## Core System Operations\n`;
    doc += `This session is optimized for a **${options.audienceVariant}** audience. We emphasize high-level strategic architecture and core deployment matrices.\n\n`;
    doc += `## Key Escalation Guidelines\n`;
    doc += `Maintain clean communication handovers and log escalations inside Central Operations directory.\n`;
  } else if (options.structure === 'Headings + subheadings') {
    doc += `## Section 1: Strategic Foundations\n`;
    doc += `### 1.1 Structural Parameters\n`;
    doc += `Providing optimal system stability requires setting explicit constraints. This matches the **${options.tone}** tone profile requested.\n\n`;
    doc += `### 1.2 System Integration Map\n`;
    doc += `All services route queries via an active gateway layer before contacting server cores.\n\n`;
    doc += `## Section 2: Operational Escalation Rules\n`;
    doc += `### 2.1 Handover Sequence\n`;
    doc += `If SLAs are breached, direct lead pinging must trigger in under 15 minutes.`;
  } else {
    // Flat narrative
    doc += `### Operational Narrative Summary\n`;
    doc += `This flat report delivers a direct operational narrative for ${topic} configured in a **${options.tone}** tone. `;
    doc += `We outline how containers and workflows should maintain reliable operation. Teams should register custom configurations early in the launch cycle. `;
    doc += `Any anomalies or handovers are logged centrally. Staging values must perfectly mirror production to keep delivery clean.`;
  }

  if (options.includeCharts && options.chartTypes.length > 0) {
    doc += `\n\n### 📊 Configured Reference Matrix & Charts:\n`;
    options.chartTypes.forEach(chart => {
      doc += `* **[Chart Enabled: ${chart.toUpperCase()}]**\n`;
      if (chart.includes('flow')) {
        doc += `  - *Visual Flow*: Ingestion -> Token Parser -> Document Structure Validation -> Render Output.\n`;
      } else if (chart.includes('table')) {
        doc += `  - *Comparison Table*:\n`;
        doc += `    | Resource | Compressible | Outage Risk | Escalation Channel |\n`;
        doc += `    | --- | --- | --- | --- |\n`;
        doc += `    | CPU | Yes | Medium (Throttling) | DevOps Staging |\n`;
        doc += `    | Memory | No | Critical (OOMKill) | SRE Direct |\n`;
      } else {
        doc += `  - *Timeline Matrix*: Month 1: Audit -> Month 2: Test Staging -> Month 3: Go Live.\n`;
      }
    });
  }

  return doc;
}
