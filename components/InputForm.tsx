
import React, { useState, useRef } from 'react';
import { DecisionInput, Role, DecisionDepth, ExplanationLevel, Language } from '../types';
import Tooltip from './Tooltip';
import { transcribeAudio } from '../geminiService';

interface InputFormProps {
  onSubmit: (data: DecisionInput) => void;
  isLoading: boolean;
}

const ROLES: Role[] = ['Optimist', 'Skeptic', 'Analyst', 'Realist', 'Ethicist'];
const LANGUAGES: { name: Language; label: string }[] = [
  { name: 'English', label: 'English' },
  { name: 'Hindi', label: 'हिन्दी (Hindi)' },
  { name: 'Marathi', label: 'मराठी (Marathi)' },
  { name: 'Bengali', label: 'বাংলা (Bengali)' },
  { name: 'Telugu', label: 'తెలుగు (Telugu)' }
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<DecisionInput>({
    question: '',
    context: '',
    enabledRoles: ['Analyst', 'Realist', 'Skeptic'],
    depth: 'Deep',
    level: 'Detailed',
    constraints: '',
    language: 'English',
    media: []
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia = [...(formData.media || [])];
    
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newMedia.push({
          data: event.target?.result as string,
          mimeType: files[i].type
        });
        setFormData(prev => ({ ...prev, media: newMedia }));
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const text = await transcribeAudio(base64, 'audio/webm');
            setFormData(prev => ({ ...prev, context: prev.context + ' ' + text }));
          };
          reader.readAsDataURL(blob);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) return alert("Question is required.");
    if (!formData.context.trim()) return alert("Context is required.");
    if (formData.enabledRoles.length === 0) return alert("Enable at least one reasoning agent.");
    onSubmit({ ...formData, timestamp: Date.now() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Decision Question
            <Tooltip text="The core choice you are trying to make. Be specific.">
              <i className="fa-solid fa-circle-info text-xs text-slate-600"></i>
            </Tooltip>
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-lg"
            placeholder="e.g., Should we expand to the European market next quarter?"
            value={formData.question}
            onChange={e => setFormData({ ...formData, question: e.target.value })}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Context & Background
            <Tooltip text="Provide all relevant data, history, and nuances.">
              <i className="fa-solid fa-circle-info text-xs text-slate-600"></i>
            </Tooltip>
          </label>
          <div className="relative">
            <textarea
              required
              rows={5}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pb-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
              placeholder="Detailed market research, internal capabilities..."
              value={formData.context}
              onChange={e => setFormData({ ...formData, context: e.target.value })}
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-rose-500 animate-pulse text-white' : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Supporting Media
              <Tooltip text="Upload images (charts, photos) or video for the engine to analyze.">
                <i className="fa-solid fa-circle-info text-xs text-slate-600"></i>
              </Tooltip>
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all">
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFile} />
                <i className="fa-solid fa-plus text-slate-500"></i>
              </label>
              {formData.media?.map((m, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                  {m.mimeType.startsWith('image/') ? (
                    <img src={m.data} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <i className="fa-solid fa-video text-xs text-slate-500"></i>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, media: prev.media?.filter((_, idx) => idx !== i) }))}
                    className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white"
                  >
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
             <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Reasoning Agents
              <Tooltip text="Toggle different AI perspectives for the debate.">
                <i className="fa-solid fa-circle-info text-xs text-slate-600"></i>
              </Tooltip>
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    enabledRoles: prev.enabledRoles.includes(role)
                      ? prev.enabledRoles.filter(r => r !== role)
                      : [...prev.enabledRoles, role]
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    formData.enabledRoles.includes(role)
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800/50">
          <div className="col-span-2 md:col-span-1">
             <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Language</label>
             <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value as Language})}
             >
                {LANGUAGES.map(lang => (
                  <option key={lang.name} value={lang.name}>{lang.label}</option>
                ))}
             </select>
          </div>
          <div className="col-span-2 md:col-span-1">
             <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Constraints</label>
             <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500"
                placeholder="$ budget..."
                value={formData.constraints}
                onChange={e => setFormData({...formData, constraints: e.target.value})}
             />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Depth</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs"
              value={formData.depth}
              onChange={e => setFormData({...formData, depth: e.target.value as DecisionDepth})}
            >
              <option value="Quick">Quick</option>
              <option value="Deep">Deep (High IQ)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Detail</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs"
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value as ExplanationLevel})}
            >
              <option value="Simple">Simple</option>
              <option value="Detailed">Detailed</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
          isLoading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]'
        }`}
      >
        {isLoading ? (
          <><i className="fa-solid fa-spinner animate-spin"></i> Reasoning...</>
        ) : (
          <><i className="fa-solid fa-bolt-lightning"></i> Execute Engine</>
        )}
      </button>
    </form>
  );
};

export default InputForm;
