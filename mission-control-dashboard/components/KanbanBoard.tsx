"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'inbox' | 'next' | 'waiting' | 'scheduled' | 'done';
  agent?: string;
}

const COLUMNS = [
  { id: 'inbox', title: 'INBOX' },
  { id: 'next', title: 'NEXT' },
  { id: 'waiting', title: 'WAITING' },
  { id: 'scheduled', title: 'SCHEDULED' },
  { id: 'done', title: 'COMPLETE' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Fetch tasks from API
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)] overflow-x-auto p-6 pt-24">
      {COLUMNS.map((col) => (
        <div key={col.id} className="kanban-col min-w-[280px] flex-1 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 tracking-widest">{col.title}</h3>
            <span className="text-xs font-mono text-gray-600">{tasks.filter(t => t.status === col.id).length}</span>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {tasks.filter(t => t.status === col.id).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            <button className="w-full py-2 rounded border border-dashed border-gray-800 text-gray-600 text-xs hover:text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2">
              <Plus size={12} /> ADD
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="task-card glass-panel p-4 rounded-lg cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          task.agent ? 'bg-[#bc13fe]/20 text-[#bc13fe]' : 'bg-gray-800 text-gray-400'
        }`}>
          {task.agent || 'TASK'}
        </span>
        <MoreHorizontal size={14} className="text-gray-600 opacity-0 group-hover:opacity-100" />
      </div>
      <p className="text-sm font-medium text-gray-200 leading-snug">{task.title}</p>
    </motion.div>
  );
}
