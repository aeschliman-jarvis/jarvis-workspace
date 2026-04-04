import GodView from '@/components/GodView';
import KanbanBoard from '@/components/KanbanBoard';
import AgentOrbit from '@/components/AgentOrbit';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pb-24">
      <GodView />
      <KanbanBoard />
      <AgentOrbit />
      
      {/* Background Glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#bc13fe]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#00f3ff]/5 rounded-full blur-[100px] pointer-events-none" />
    </main>
  );
}
