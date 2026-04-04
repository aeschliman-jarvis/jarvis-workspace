"use client";
import { Activity, Cpu, Zap, Terminal } from 'lucide-react';

export default function GodView() {
  return (
    <header className="god-header h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0aff60] animate-pulse shadow-[0_0_10px_#0aff60]" />
          <span className="font-bold text-lg tracking-widest text-white">MISSION CONTROL</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <TelemetryItem icon={<Activity size={16} />} label="GATEWAY" value="12ms" color="text-[#00f3ff]" />
        <TelemetryItem icon={<Cpu size={16} />} label="AGENTS" value="3 ACTIVE" color="text-[#bc13fe]" />
        <TelemetryItem icon={<Zap size={16} />} label="TOKENS" value="24.5K" color="text-[#0aff60]" />
        <TelemetryItem icon={<Terminal size={16} />} label="SESSION" value="MAIN" color="text-white" />
      </div>
    </header>
  );
}

function TelemetryItem({ icon, label, value, color }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center gap-2 text-xs font-mono uppercase opacity-60 mb-1`}>
        {icon} {label}
      </div>
      <div className={`font-mono font-bold text-sm ${color} neon-text`}>{value}</div>
    </div>
  );
}
