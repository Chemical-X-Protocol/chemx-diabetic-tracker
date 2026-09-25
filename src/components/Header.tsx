import React from 'react';
import {
  Syringe,
  Activity,
  Bell,
  FileText,
  Stethoscope,
  Zap,
  Settings,
  Plus,
  Clock,
} from 'lucide-react';
import { ChemxSwarmStatus } from '../types/diabetic';

interface Props {
  activeTab: 'tasks' | 'glucose' | 'reminders' | 'logs';
  setActiveTab: (tab: 'tasks' | 'glucose' | 'reminders' | 'logs') => void;
  onOpenLogShot: () => void;
  onOpenLogGlucose: () => void;
  onOpenDoctorReport: () => void;
  onOpenChemx: () => void;
  onOpenSettings: () => void;
  tasksCompleted: number;
  tasksTotal: number;
  activeRemindersCount: number;
  chemxStatus?: ChemxSwarmStatus;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenLogShot,
  onOpenLogGlucose,
  onOpenDoctorReport,
  onOpenChemx,
  onOpenSettings,
  tasksCompleted,
  tasksTotal,
  activeRemindersCount,
  chemxStatus,
}) => {
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Title, ChemX Badge, & Quick Actions */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Syringe className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Diabetic Tracker <span className="text-teal-600 dark:text-teal-400 font-mono text-xs">v0</span>
                </h1>
                
                {/* Enhanced by chemx interactive badge */}
                <button
                  onClick={onOpenChemx}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 hover:border-teal-500 transition-all cursor-pointer shadow-2xs"
                  title="Click to view ChemX live index.db tasks & architecture audit"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <Zap className="w-3 h-3 fill-teal-500 text-teal-600" />
                  <span>Enhanced by chemx</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>{todayFormatted}</span>
                <span>•</span>
                <span className="text-teal-600 dark:text-teal-400 font-medium">
                  {tasksCompleted}/{tasksTotal} doses taken today
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogGlucose}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5" /> + BG Check
            </button>

            <button
              onClick={onOpenLogShot}
              className="px-3 py-1.5 text-xs font-bold rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1"
            >
              <Syringe className="w-3.5 h-3.5" /> + Log Shot
            </button>

            <button
              onClick={onOpenDoctorReport}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-300" /> Doctor Report
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Patient profile & settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Insulin Tasks & Rotation</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'tasks'
                  ? 'bg-teal-700 text-teal-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tasksCompleted}/{tasksTotal}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('glucose')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'glucose'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Glucose Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Daily Reminders</span>
            {activeRemindersCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'reminders'
                    ? 'bg-indigo-700 text-indigo-100'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {activeRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Historical Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
