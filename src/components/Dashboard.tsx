import React, { useState } from 'react';
import { Session, FileType } from '../types';
import { 
  Video, 
  FileText, 
  History, 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  ArrowRight,
  Clock
} from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
  onStartNewSession: (type: FileType) => void;
}

export default function Dashboard({ sessions, onSelectSession, onStartNewSession }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'document'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week'>('all');

  // List unique topics
  const availableTopics = Array.from(
    new Set(sessions.map((s) => s.topic).filter(Boolean))
  ) as string[];

  const filteredSessions = sessions.filter((session) => {
    // Search match
    const matchesSearch = 
      session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.topic && session.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      session.file.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Type match
    const matchesType = filterType === 'all' || session.type === filterType;

    // Topic match
    const matchesTopic = filterTopic === 'all' || session.topic === filterTopic;

    // Date match
    let matchesDate = true;
    if (filterDate === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      matchesDate = session.createdAt.startsWith(todayStr);
    } else if (filterDate === 'week') {
      const date = new Date(session.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesDate = date >= oneWeekAgo;
    }

    return matchesSearch && matchesType && matchesTopic && matchesDate;
  });

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Ingestion Panel */}
      <div className="bg-gradient-to-br from-[#008567]/5 via-white to-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        {/* Glow decorative spheres */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#2ad2c9]/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#ff8d6d]/5 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            TrainDoc Workspace
          </h1>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
            A user-controlled training documentation assistant. No automatic triggers, no unrequested AI processing. Upload, configure each parameter explicitly, and compile beautiful specifications on your terms.
          </p>
        </div>

        {/* Core Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {/* Card 1: Video */}
          <button
            id="action-video-ingestion-btn"
            onClick={() => onStartNewSession('video')}
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#008567]/50 rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#008567]/5 group-hover:border-[#008567]/20 transition-all">
              <Video className="w-6 h-6 text-[#008567]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#008567] transition-colors mb-1.5 flex items-center gap-1.5">
              Upload Video Ingestion
              <ArrowRight className="w-4 h-4 text-[#008567] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ingest MP4, MOV, or WEBM clips. Customize speaker diarization, timestamps, and sample-frame OCR.
            </p>
          </button>

          {/* Card 2: Document */}
          <button
            id="action-doc-ingestion-btn"
            onClick={() => onStartNewSession('document')}
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#008567]/50 rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#008567]/5 group-hover:border-[#008567]/20 transition-all">
              <FileText className="w-6 h-6 text-[#008567]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#008567] transition-colors mb-1.5 flex items-center gap-1.5">
              Ingest Documents
              <ArrowRight className="w-4 h-4 text-[#008567] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload PDF, DOCX, PPTX, or TXT materials. Preview parsed structural sections before compiling summaries.
            </p>
          </button>

          {/* Card 3: Session History */}
          <button
            id="action-history-navigation-btn"
            onClick={() => {
              const element = document.getElementById('past-sessions-library');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#ff8d6d]/50 rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#ff8d6d]/5 group-hover:border-[#ff8d6d]/20 transition-all">
              <History className="w-6 h-6 text-[#ff8d6d]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#ff8d6d] transition-colors mb-1.5 flex items-center gap-1.5">
              Previous Sessions
              <ArrowRight className="w-4 h-4 text-[#ff8d6d] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Revisit and reload past compiled libraries. Rerun generation prompts with alternate configurations.
            </p>
          </button>
        </div>
      </div>

      {/* Library View Section */}
      <div id="past-sessions-library" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Library & Logs</h2>
            <p className="text-xs text-slate-500 mt-1">Review, sort, and filter your complete repository history.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              Total Sessions: <strong className="text-[#008567]">{sessions.length}</strong>
            </span>
          </div>
        </div>

        {/* Filters and Search toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              id="library-search-input"
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008567] focus:ring-1 focus:ring-[#008567]/20"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="filter-type-select"
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none w-full cursor-pointer"
            >
              <option value="all">All Ingestion Types</option>
              <option value="video">Videos Only</option>
              <option value="document">Documents Only</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              id="filter-topic-select"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none w-full cursor-pointer"
            >
              <option value="all">All Modules & Topics</option>
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              id="filter-date-select"
              value={filterDate}
              onChange={(e: any) => setFilterDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none w-full cursor-pointer"
            >
              <option value="all">All Time Logs</option>
              <option value="today">Created Today</option>
              <option value="week">Past 7 Days</option>
            </select>
          </div>
        </div>

        {/* Sessions list */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                id={`session-card-${session.id}`}
                onClick={() => onSelectSession(session)}
                className="group p-5 bg-white border border-slate-200 hover:border-[#008567]/30 rounded-2xl text-left transition-all cursor-pointer hover:shadow-sm relative overflow-hidden"
              >
                {/* Decorative pill tag */}
                <span
                  className={`absolute top-0 right-0 h-1.5 w-24 rounded-bl-lg ${
                    session.type === 'video' ? 'bg-[#008567]' : 'bg-[#ff8d6d]'
                  }`}
                />

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    {session.type === 'video' ? (
                      <div className="p-2 bg-[#008567]/10 rounded-lg text-[#008567]">
                        <Video className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 bg-[#ff8d6d]/10 rounded-lg text-[#ff8d6d]">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#008567] transition-colors truncate max-w-[180px] sm:max-w-[240px]">
                        {session.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {session.topic && (
                    <div className="text-[11px] inline-flex items-center gap-1.5 bg-[#008567]/5 text-[#008567] px-2 py-0.5 rounded-md border border-[#008567]/10 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008567]" />
                      {session.topic}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 line-clamp-1">
                    File: <span className="text-slate-700 font-semibold">{session.file.name}</span>
                  </p>
                </div>

                {/* Badges for active compiled docs */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                  {session.docs.transcript && (
                    <span className="text-[9px] bg-[#2ad2c910] border border-[#2ad2c920] text-[#008567] font-bold px-1.5 py-0.5 rounded">
                      TRANSCRIPT (v{session.docs.transcript.length})
                    </span>
                  )}
                  {session.docs.summary && (
                    <span className="text-[9px] bg-[#00856710] border border-[#00856720] text-[#008567] font-bold px-1.5 py-0.5 rounded">
                      SUMMARY (v{session.docs.summary.length})
                    </span>
                  )}
                  {session.docs.faq && (
                    <span className="text-[9px] bg-[#ff8d6d10] border border-[#ff8d6d20] text-[#ff8d6d] font-bold px-1.5 py-0.5 rounded">
                      FAQ (v{session.docs.faq.length})
                    </span>
                  )}
                  {session.docs.architectureReport && (
                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                      DIAGRAMS (v{session.docs.architectureReport.length})
                    </span>
                  )}
                  {session.docs.wordDoc && (
                    <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded">
                      WORD (v{session.docs.wordDoc.length})
                    </span>
                  )}
                  {!Object.keys(session.docs).some((k) => (session.docs as any)[k]) && (
                    <span className="text-[9px] text-slate-400 italic">No compilations yet — Ready</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
            <History className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-slate-700 font-medium text-sm">No matched sessions found</p>
            <p className="text-slate-400 text-xs mt-1">
              Start by uploading training videos or documentation above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
