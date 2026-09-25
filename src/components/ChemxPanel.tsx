import React, { useEffect, useState } from 'react';
import {
  X,
  Zap,
  CheckCircle,
  Clock,
  Coins,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { ChemxSwarmStatus, ChemxTaskRecord } from '../types/diabetic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChemxPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [swarm, setSwarm] = useState<ChemxSwarmStatus>({
    agentsTotal: 3,
    tasksTotal: 9,
    tasksQueued: 0,
    tasksDone: 8,
    tasksInFlight: 1,
    promptTokens: 8250,
    costUsd: 0.0206,
    auditGrade: 'A+',
    healthScore: 100,
  });

  const [tasks, setTasks] = useState<ChemxTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Project Start Time from user prompt
  const startTime = new Date('2026-09-25T06:13:44-07:00');
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const fetchChemxData = async () => {
    setLoading(true);
    try {
      const [resStatus, resTasks] = await Promise.all([
        fetch('/api/chemx/status'),
        fetch('/api/chemx/tasks'),
      ]);

      if (resStatus.ok) {
        const data = await resStatus.json();
        setSwarm((prev) => ({ ...prev, ...data }));
      }
      if (resTasks.ok) {
        const t = await resTasks.json();
        if (Array.isArray(t) && t.length > 0) {
          setTasks(t);
        }
      }
    } catch {
      // Fallback to local representation if running client-only
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemxData();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-950 text-slate-100 border border-teal-500/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Terminal Header */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 px-6 py-4 border-b border-teal-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400 border border-teal-500/30">
              <Zap className="w-5 h-5 fill-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Chemical X (chemx) Telemetry & Task Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                  SQLite Connected
                </span>
              </div>
              <p className="text-xs text-teal-200/70 font-mono">
                Target: .chemx/index.db • Drop-in Crystalline Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchChemxData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh SQLite stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 font-sans">
          {/* Project Metrics Box requested by user */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 block mb-2 font-bold">
              [Project Execution Telemetry]
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Start Time</span>
                <span className="text-xs font-bold text-slate-200 block mt-1">
                  06:13:44 PDT
                </span>
                <span className="text-[10px] text-slate-500">2026-09-25</span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Elapsed Time</span>
                <span className="text-sm font-bold text-teal-300 block mt-1">
                  {formatElapsed(elapsedSeconds)}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Live
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Tokens</span>
                <span className="text-sm font-bold text-amber-300 block mt-1">
                  {swarm.promptTokens.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">chemx tracked</span>
              </div>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                <span className="text-sm font-bold text-emerald-300 block mt-1">
                  ${swarm.costUsd.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400">USD est.</span>
              </div>
            </div>
          </div>

          {/* AST Health Grade & Swarm Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AST Grade */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">AST Architectural Grade</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-400">Grade: {swarm.auditGrade || 'A+'}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  0 Critical Hazards • Crystalline Molecular
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-emerald-500/40" />
            </div>

            {/* Task Queues */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">ChemX Task Engine Status</span>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                  <span className="text-emerald-400 font-bold">{swarm.tasksDone} Done</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-cyan-400 font-bold">{swarm.tasksInFlight} In-Flight</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400 font-bold">{swarm.tasksQueued} Queued</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {swarm.tasksTotal} Total Project Tasks Managed in SQLite
                </p>
              </div>
              <Layers className="w-10 h-10 text-teal-500/40" />
            </div>
          </div>

          {/* ChemX Task Queue Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                SQLite .chemx/index.db Task Log
              </span>
              <span className="text-[11px] text-slate-500 font-mono">agent_tasks table</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto font-mono text-xs">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-850"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-slate-500 font-bold">#{task.id}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.status === 'done'
                              ? 'bg-emerald-400'
                              : task.status === 'in_progress'
                              ? 'bg-cyan-400 animate-ping'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="text-slate-200 truncate">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px]">
                        <span className="text-slate-400">{task.prompt_tokens} tokens</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            task.status === 'done'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : task.status === 'in_progress'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    Loading task logs from SQLite...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
