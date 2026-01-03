
import React, { useState } from 'react';
import { DecisionResult as DecisionResultType } from '../types';
import { generateSpeech } from '../geminiService';

interface ResultProps {
  result: DecisionResultType;
  onReset: () => void;
  language?: string;
}

const DecisionResult: React.FC<ResultProps> = ({ result, onReset, language = 'English' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTTS = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioData = await generateSpeech(result.decisionSummary, language);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await audioContext.decodeAudioData(audioData.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Proceed': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/5';
      case 'Do Not Proceed': return 'text-rose-400 border-rose-500/50 bg-rose-500/5';
      default: return 'text-amber-400 border-amber-500/50 bg-amber-500/5';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* Visual Header */}
      {result.visualOutcomeUrl && (
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative group border border-slate-800">
          <img src={result.visualOutcomeUrl} className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Core Representation</span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter line-clamp-2">
              {result.finalVerdict}: {result.decisionSummary.split('.')[0]}
            </h2>
          </div>
        </div>
      )}

      {/* Main Verdict Section */}
      <div className={`p-8 rounded-3xl border-2 ${getVerdictColor(result.finalVerdict)} flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm`}>
        <div className="space-y-4 text-center md:text-left flex-grow">
          <div className="flex items-center gap-4 justify-center md:justify-start">
             <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">Final Decision</span>
             <button
               onClick={handleTTS}
               className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <i className={`fa-solid ${isPlaying ? 'fa-volume-high' : 'fa-volume-low'}`}></i>
             </button>
          </div>
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight">{result.finalVerdict}</h2>
          <p className="max-w-2xl text-lg leading-relaxed opacity-90">{result.decisionSummary}</p>
        </div>
        <div className="flex flex-col items-center min-w-[150px]">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="10" className="opacity-10" />
              <circle
                cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="10"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * result.confidenceScore.percentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-2xl">
              {result.confidenceScore.percentage}%
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Confidence Level</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
               <i className="fa-solid fa-glasses"></i> Bias Detection
             </h3>
             <p className="text-sm italic text-slate-300 leading-relaxed">"{result.biasAndAssumptions.detectedBias}"</p>
           </section>

           <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-link"></i> Grounding Sources
              </h3>
              <div className="space-y-2">
                {result.groundingUrls?.map((url, i) => (
                  <a key={i} href={url.uri} target="_blank" className="block text-xs text-emerald-500 hover:underline truncate">
                    <i className="fa-solid fa-earth-americas mr-2 opacity-50"></i>
                    {url.title}
                  </a>
                )) || <div className="text-[10px] text-slate-600 italic">No external grounding required.</div>}
              </div>
           </section>

           <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Risk Exposure</h3>
              <div className={`text-2xl font-black uppercase tracking-wider ${result.riskExposure.level === 'High' ? 'text-rose-500' : result.riskExposure.level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {result.riskExposure.level}
              </div>
              <p className="text-xs text-slate-400 mt-2">{result.riskExposure.justification}</p>
           </section>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.roleBasedInsights.map((insight, i) => (
              <div key={i} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                  {insight.role}
                </h4>
                <ul className="space-y-2">
                  {insight.insights.map((text, j) => (
                    <li key={j} className="text-xs text-slate-300 leading-relaxed">• {text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-900">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
              <i className="fa-solid fa-microchip text-emerald-500"></i> Scenario Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Best Case</span>
                 <p className="text-sm text-slate-300">{result.scenarioOutcomes.bestCase}</p>
              </div>
              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                 <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">Worst Case</span>
                 <p className="text-sm text-slate-300">{result.scenarioOutcomes.worstCase}</p>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                 <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">Most Likely</span>
                 <p className="text-sm text-slate-300">{result.scenarioOutcomes.mostLikely}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-12">
        <button
          onClick={onReset}
          className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-bold uppercase tracking-widest transition-all border border-slate-700"
        >
          Reset Engine
        </button>
      </div>
    </div>
  );
};

export default DecisionResult;
