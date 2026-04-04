"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AGENTS = [
  { id: 'researcher', name: 'Researcher', icon: '🔍', desc: 'Market data, facts, competitive intel' },
  { id: 'designer', name: 'Designer', icon: '🎨', desc: 'Visual concepts, brand direction' },
  { id: 'logistics', name: 'Logistics', icon: '📦', desc: 'Vendor sourcing, ops, timelines' },
  { id: 'financier', name: 'Financier', icon: '💰', desc: 'Unit economics, projections' },
  { id: 'writer', name: 'Writer', icon: '✍️', desc: 'Copy, landing pages, content' },
  { id: 'strategist', name: 'Strategist', icon: '♟️', desc: 'Positioning, GTM, growth' },
  { id: 'generalist', name: 'Generalist', icon: '⚙️', desc: 'General execution and research' },
];

export default function MissionModal({ isOpen, onClose }: Props) {
  const [goal, setGoal] = useState('');
  const [agent, setAgent] = useState('generalist');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/missions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, agentType: agent }),
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setGoal('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl glass-panel rounded-2xl overflow-hidden border border-[#00f3ff]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Zap className="text-[#00f3ff]" size={24} />
                    Launch New Mission
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Define the objective and select your agent.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#00f3ff] mb-3 tracking-widest">Mission Objective</label>
                  <textarea 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Research the top 5 profitable home services in the Twin Cities with under $10k startup costs..."
                    className="w-full bg-black/40 border border-gray-800 rounded-lg p-4 text-white placeholder-gray-600 focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] transition-all min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#00f3ff] mb-3 tracking-widest">Select Agent</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAgent(a.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          agent === a.id 
                            ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                            : 'bg-black/20 border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{a.icon}</span>
                          <span className={`font-bold ${agent === a.id ? 'text-white' : 'text-gray-300'}`}>{a.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={status !== 'idle'}
                    className={`px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${
                      status === 'success' 
                        ? 'bg-[#0aff60] text-black' 
                        : 'bg-[#00f3ff] text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                    }`}
                  >
                    {status === 'loading' ? 'INITIALIZING...' : status === 'success' ? 'MISSION LAUNCHED' : 'LAUNCH'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
