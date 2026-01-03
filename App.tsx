
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import DecisionResultView from './components/DecisionResult';
import Chatbot from './components/Chatbot';
import HistorySidebar from './components/HistorySidebar';
import { DecisionInput, DecisionResult, HistoryItem, Role } from './types';
import { evaluateDecision, generateDecisionVisual, generateDecisionVideo } from './geminiService';

const LOADING_STEPS = [
  { agent: 'System', task: 'Initializing Neural Logic Core...', progress: 10 },
  { agent: 'Analyst', task: 'Auditing context and extraction of assumptions...', progress: 25 },
  { agent: 'Skeptic', task: 'Identifying high-impact risks and failure modes...', progress: 40 },
  { agent: 'Optimist', task: 'Modeling growth pathways and upside potential...', progress: 55 },
  { agent: 'Realist', task: 'Calculating execution difficulty and constraints...', progress: 70 },
  { agent: 'Ethicist', task: 'Evaluating long-term social and ethical impact...', progress: 85 },
  { agent: 'Arbiter', task: 'Synthesizing verdict and confidence scores...', progress: 95 },
];

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [currentInput, setCurrentInput] = useState<DecisionInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('decido_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleEvaluate = async (input: DecisionInput) => {
    setLoading(true);
    setError(null);
    setLoadingStep(0);
    setCurrentInput(input);

    try {
      // 1. Evaluate Core Decision
      const data = await evaluateDecision(input);
      
      // 2. Background task: Visual Generation
      const creativeRes = { visual: '', video: '' };
      try {
        if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
           const hasKey = await (window as any).aistudio.hasSelectedApiKey();
           if (!hasKey) {
             await (window as any).aistudio.openSelectKey();
           }
        }
        creativeRes.visual = await generateDecisionVisual(data.decisionSummary);
      } catch (creativeErr) {
        console.warn("Creative features failed:", creativeErr);
      }

      const finalData = { ...data, visualOutcomeUrl: creativeRes.visual };
      setResult(finalData);
      
      const newHistory = [{ input, result: finalData }, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem('decido_history', JSON.stringify(newHistory));
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during reasoning.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentInput(null);
  };

  const currentStep = LOADING_STEPS[loadingStep];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-emerald-500/30">
      <Header />
      
      <div className="fixed top-20 right-6 z-40">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all shadow-xl"
        >
          <i className="fa-solid fa-clock-rotate-left mr-2"></i> HISTORY
        </button>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        {!result && !loading && (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight">
                COMPLEXITY <span className="text-emerald-500">DECODED.</span>
              </h2>
              <p className="text-slate-400 text-xl max-w-xl mx-auto font-light">
                Leverage high-IQ multi-agent reasoning for critical enterprise and personal decisions.
              </p>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/50 p-10 rounded-[3rem] backdrop-blur-md shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <i className="fa-solid fa-microchip text-9xl"></i>
               </div>
              <InputForm onSubmit={handleEvaluate} isLoading={loading} />
            </div>
          </div>
        )}

        {loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 max-w-lg mx-auto w-full">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-emerald-500/5 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-32 h-32 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-brain text-4xl text-emerald-400 animate-pulse"></i>
              </div>
            </div>

            <div className="w-full space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-100 animate-fadeIn">
                  {currentStep.agent} <span className="text-emerald-500">is active</span>
                </h3>
                <p className="text-slate-400 text-sm font-medium tracking-wide h-6">
                  {currentStep.task}
                </p>
              </div>

              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${currentStep.progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center px-1">
                <div className="flex gap-2">
                  {LOADING_STEPS.map((step, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        idx === loadingStep ? 'bg-emerald-500 scale-125' : 
                        idx < loadingStep ? 'bg-emerald-900' : 'bg-slate-800'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-500 tracking-[0.2em] uppercase">
                  Reasoning Core V3
                </span>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-center">
               <p className="text-[10px] text-emerald-400/60 font-mono leading-relaxed uppercase tracking-widest">
                Thinking Budget: 32768 tokens allocated<br/>
                Cross-checking {currentInput?.enabledRoles.length} reasoning agents
               </p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-10 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-center space-y-6">
            <i className="fa-solid fa-triangle-exclamation text-5xl text-rose-500"></i>
            <h3 className="text-2xl font-black text-white uppercase">Neural Interruption</h3>
            <p className="text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-10 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-all"
            >
              Return to Interface
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-6xl mx-auto">
             <DecisionResultView 
               result={result} 
               onReset={handleReset} 
               language={currentInput?.language || 'English'}
             />
          </div>
        )}
      </main>

      <Chatbot />
      <HistorySidebar
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(item) => {
          setResult(item.result);
          setCurrentInput(item.input);
        }}
      />

      <footer className="py-12 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-700">
          <div className="text-center md:text-left">&copy; 2024 DECIDO LOGIC SYSTEMS</div>
          <div className="text-center">MULTI-AGENT DEBATE CORE v3.1</div>
          <div className="text-center md:text-right">NEUTRALITY PROTOCOL ACTIVE</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
