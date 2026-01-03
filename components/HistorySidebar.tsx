
import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-80 h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Decision Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 text-slate-600 text-xs italic">No past decisions recorded.</div>
          ) : (
            history.map((item, i) => (
              <button
                key={i}
                onClick={() => { onSelect(item); onClose(); }}
                className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group"
              >
                <div className="text-xs font-mono text-emerald-500 mb-1">
                  {new Date(item.input.timestamp || 0).toLocaleDateString()}
                </div>
                <div className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-white">
                  {item.input.question}
                </div>
                <div className={`mt-2 text-[10px] font-bold uppercase inline-block px-1.5 py-0.5 rounded border ${
                  item.result.finalVerdict === 'Proceed' ? 'border-emerald-500 text-emerald-400' :
                  item.result.finalVerdict === 'Do Not Proceed' ? 'border-rose-500 text-rose-400' :
                  'border-amber-500 text-amber-400'
                }`}>
                  {item.result.finalVerdict}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
