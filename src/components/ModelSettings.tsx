import React, { useState } from 'react';
import { LLMConfig, LLMProvider } from '../types';
import { Settings, Play, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ModelSettingsProps {
  config: LLMConfig;
  onChange: (config: LLMConfig) => void;
}

export default function ModelSettings({ config, onChange }: ModelSettingsProps) {
  const [pingStatus, setPingStatus] = useState<{
    state: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
  }>({ state: 'idle' });

  const testConnection = async () => {
    setPingStatus({ state: 'testing' });
    try {
      if (config.provider === 'sandbox') {
        // Instant success for simulation
        setTimeout(() => {
          setPingStatus({
            state: 'success',
            message: 'Sandbox simulator verified! Ready to process documents offline.'
          });
        }, 800);
        return;
      }

      if (config.clientSideDirect && config.provider === 'ollama') {
        // Direct browser-side test
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        try {
          const res = await fetch(`${config.endpoint}/api/tags`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            setPingStatus({
              state: 'success',
              message: `Direct Browser Ping successful! Found models: ${
                data.models ? data.models.map((m: any) => m.name).join(', ') : 'none'
              }`
            });
          } else {
            setPingStatus({
              state: 'error',
              message: `Ollama returned status ${res.status}. Ensure CORS is configured.`
            });
          }
        } catch (e: any) {
          clearTimeout(timeoutId);
          throw new Error('Connection refused. Is Ollama running locally with OLLAMA_ORIGINS="*"?');
        }
        return;
      }

      // Backend-proxied ping
      let response;
      try {
        response = await fetch('/api/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: config.provider,
            endpoint: config.endpoint,
            model: config.model
          })
        });
      } catch (networkErr: any) {
        throw new Error(`The application server is offline or unreachable. Please restart the dev server or verify your local runtime.`);
      }

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`The server returned an invalid or non-JSON response (${response.status} ${response.statusText}). Is the GEMINI_API_KEY environment variable set correctly?`);
      }

      if (response.ok && data.success) {
        setPingStatus({
          state: 'success',
          message: data.message || 'Connection test succeeded!'
        });
      } else {
        setPingStatus({
          state: 'error',
          message: data.error || 'Server failed to connect to model.'
        });
      }
    } catch (err: any) {
      setPingStatus({
        state: 'error',
        message: err.message || 'Network request failed. Ensure your server is active.'
      });
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    const updated = { ...config, provider };
    if (provider === 'gemini') {
      updated.model = 'gemini-2.5-flash';
    } else if (provider === 'ollama') {
      updated.model = config.model === 'gemini-2.5-flash' ? 'llama3' : config.model;
    }
    onChange(updated);
    setPingStatus({ state: 'idle' });
  };

  return (
    <div id="model-settings-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-800">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#008567]" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Model Provider Configuration</h2>
        </div>
        <span className="text-xs bg-[#008567]/10 text-[#008567] font-mono font-bold px-2.5 py-1 rounded-full border border-[#008567]/20">
          Abstracted Layer
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Sandbox */}
        <button
          id="provider-sandbox-btn"
          type="button"
          onClick={() => handleProviderChange('sandbox')}
          className={`relative p-4 rounded-xl text-left border-2 transition-all ${
            config.provider === 'sandbox'
              ? 'bg-[#008567]/5 border-[#008567] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`font-bold text-sm mb-1 ${config.provider === 'sandbox' ? 'text-[#008567]' : 'text-slate-800'}`}>Sandbox Simulator</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generates high-fidelity mock training docs instantly. Recommended for testing & preview frame.
          </p>
        </button>

        {/* Ollama */}
        <button
          id="provider-ollama-btn"
          type="button"
          onClick={() => handleProviderChange('ollama')}
          className={`relative p-4 rounded-xl text-left border-2 transition-all ${
            config.provider === 'ollama'
              ? 'bg-[#008567]/5 border-[#008567] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`font-bold text-sm mb-1 ${config.provider === 'ollama' ? 'text-[#008567]' : 'text-slate-800'}`}>Ollama (Llama 3/Local)</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Connect to your local Llama 3 model running on localhost or a custom server.
          </p>
        </button>

        {/* Gemini */}
        <button
          id="provider-gemini-btn"
          type="button"
          onClick={() => handleProviderChange('gemini')}
          className={`relative p-4 rounded-xl text-left border-2 transition-all ${
            config.provider === 'gemini'
              ? 'bg-[#008567]/5 border-[#008567] shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className={`font-bold text-sm mb-1 ${config.provider === 'gemini' ? 'text-[#008567]' : 'text-slate-800'}`}>Google Gemini API</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Uses Server-side Gemini API credentials. Robust cloud generation for live previews.
          </p>
        </button>
      </div>

      {config.provider !== 'sandbox' && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Endpoint URL
              </label>
              <input
                id="endpoint-url-input"
                type="text"
                value={config.endpoint}
                onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
                placeholder={config.provider === 'ollama' ? 'http://localhost:11434' : 'N/A (Server Managed)'}
                disabled={config.provider === 'gemini'}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008567] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Model Name
              </label>
              <input
                id="model-name-input"
                type="text"
                value={config.model}
                onChange={(e) => onChange({ ...config, model: e.target.value })}
                placeholder={config.provider === 'ollama' ? 'llama3' : 'gemini-2.5-flash'}
                disabled={config.provider === 'gemini'}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008567] disabled:opacity-50"
              />
            </div>
          </div>

          {config.provider === 'ollama' && (
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
              <input
                id="direct-browser-checkbox"
                type="checkbox"
                checked={config.clientSideDirect}
                onChange={(e) => onChange({ ...config, clientSideDirect: e.target.checked })}
                className="w-4 h-4 accent-[#008567] text-[#008567] border-slate-300 rounded focus:ring-[#008567]"
              />
              <div>
                <label htmlFor="direct-browser-checkbox" className="block text-xs font-bold text-slate-800 cursor-pointer">
                  Client-Side Direct Mode (Highly Recommended for localhost)
                </label>
                <p className="text-[11px] text-slate-500">
                  Connects directly from your browser. Bypasses server container limits to reach local machine.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ping Test Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
        <div className="text-xs text-slate-500">
          Verify configuration with a real-time connection handshake.
        </div>
        <button
          id="ping-model-btn"
          type="button"
          onClick={testConnection}
          disabled={pingStatus.state === 'testing'}
          className="flex items-center justify-center gap-2 bg-[#008567] hover:bg-[#01a982] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {pingStatus.state === 'testing' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Pinging Endpoint...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Ping Model
            </>
          )}
        </button>
      </div>

      {/* Ping Results */}
      {pingStatus.state !== 'idle' && (
        <div
          id="ping-result-alert"
          className={`mt-4 p-4 rounded-xl border flex gap-3 ${
            pingStatus.state === 'success'
              ? 'bg-[#00856710] border-[#00856720] text-[#008567]'
              : 'bg-[#ff8d6d10] border-[#ff8d6d20] text-[#ff8d6d]'
          }`}
        >
          {pingStatus.state === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#008567] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#ff8d6d] shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <span className="font-bold block mb-1">
              {pingStatus.state === 'success' ? 'Handshake Successful' : 'Connection Failure'}
            </span>
            {pingStatus.message}
            {pingStatus.state === 'error' && config.provider === 'ollama' && (
              <p className="mt-2 text-[11px] text-slate-500 border-t border-[#ff8d6d20] pt-2">
                Tip: If your Ollama server is on your own computer, make sure it is running (`ollama serve`) and CORS origins include the AI Studio Preview URL or `*`. In macOS/Linux, set environmental variable `OLLAMA_ORIGINS="*"` and restart Ollama. Or toggle **Sandbox Simulator** mode to test with instant local outputs!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
