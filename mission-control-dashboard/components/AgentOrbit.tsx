"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import MissionModal from './MissionModal';

export default function AgentOrbit() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const agents = [
    { name: 'Researcher', status: 'idle', icon: '🔍' },
    { name: 'Designer', status: 'idle', icon: '🎨' },
    { name: 'Logistics', status: 'idle', icon: '📦' },
    { name: 'Financier', status: 'idle', icon: '💰' },
    { name: 'Writer', status: 'idle', icon: '✍️' },
    { name: 'Strategist', status: 'idle', icon: '♟️' },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between px-8 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0aff60] animate-pulse" />
            <span className="text-xs font-mono uppercase text-gray-500 tracking-widest">Agent Fleet</span>
          </div>
          <div className="flex gap-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-lg hover:border-[#00f3ff] hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all cursor-pointer"
                title={agent.name}
              >
                {agent.icon}
              </motion.div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]"
        >
          <Play size={12} fill="currentColor" /> Start Mission
        </button>
      </div>

      <MissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
