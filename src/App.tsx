import React, { useState, useEffect } from 'react';
import {
  DailyReminder,
  GlucoseReading,
  InjectionSite,
  INJECTION_SITES,
  InsulinLog,
  InsulinTask,
  UserProfile,
} from './types/diabetic';
import {
  DEFAULT_PROFILE,
  DEFAULT_TASKS,
  DEFAULT_REMINDERS,
  StorageManager,
  generateSeedData,
  getRecommendedNextSite,
} from './lib/storage';
import { Header } from './components/Header';
import { InsulinTaskManager } from './components/InsulinTaskManager';
import { GlucoseDashboard } from './components/GlucoseDashboard';
import { DailyReminders } from './components/DailyReminders';
import { HistoricalLogs } from './components/HistoricalLogs';
import { LogShotModal } from './components/LogShotModal';
import { LogGlucoseModal } from './components/LogGlucoseModal';
import { InjectionSiteModal } from './components/InjectionSiteModal';
import { DoctorReportModal } from './components/DoctorReportModal';
import { ChemxPanel } from './components/ChemxPanel';
import { SettingsModal } from './components/SettingsModal';
import { playChimeSound } from './lib/audioAlert';
import { BellRing, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => StorageManager.getProfile());
  const [tasks, setTasks] = useState<InsulinTask[]>(() => StorageManager.getTasks());
  const [logs, setLogs] = useState<InsulinLog[]>(() => StorageManager.getLogs());
  const [readings, setReadings] = useState<GlucoseReading[]>(() => StorageManager.getReadings());
  const [reminders, setReminders] = useState<DailyReminder[]>(() => StorageManager.getReminders());

  const [activeTab, setActiveTab] = useState<'tasks' | 'glucose' | 'reminders' | 'logs'>('tasks');

  // Modals state
  const [showLogShot, setShowLogShot] = useState(false);
  const [preselectedTask, setPreselectedTask] = useState<InsulinTask | null>(null);
  const [showLogGlucose, setShowLogGlucose] = useState(false);
  const [showSiteGuide, setShowSiteGuide] = useState(false);
  const [showDoctorReport, setShowDoctorReport] = useState(false);
  const [showChemx, setShowChemx] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active Reminder Banner
  const [activeAlarmToast, setActiveAlarmToast] = useState<DailyReminder | null>(null);

  // Derive site rotation recommendation
  const { recommendedSite, lastUsedSite } = getRecommendedNextSite(logs);

  // Sync to storage
  useEffect(() => {
    StorageManager.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    StorageManager.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageManager.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    StorageManager.saveReadings(readings);
  }, [readings]);

  useEffect(() => {
    StorageManager.saveReminders(reminders);
  }, [reminders]);

  // Periodic Reminder Checker (checks every 30 seconds against scheduled reminders)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const match = reminders.find((r) => r.enabled && r.time === currentHHMM);
      if (match && (!match.snoozedUntil || new Date(match.snoozedUntil) <= now)) {
        setActiveAlarmToast(match);
        if (match.soundEnabled) {
          playChimeSound('reminder');
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const willComplete = !t.isCompleted;
          if (willComplete) {
            playChimeSound('success');
            return {
              ...t,
              isCompleted: true,
              completedAt: new Date().toISOString(),
              actualUnits: t.defaultUnits,
              injectionSite: recommendedSite,
            };
          } else {
            return {
              ...t,
              isCompleted: false,
              completedAt: undefined,
              actualUnits: undefined,
              injectionSite: undefined,
            };
          }
        }
        return t;
      })
    );
  };

  const handleSaveShot = (newLogData: Omit<InsulinLog, 'id' | 'timestamp'>, taskId?: string) => {
    const newLogId = `log-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const createdLog: InsulinLog = {
      ...newLogData,
      id: newLogId,
      timestamp,
      taskId,
    };

    setLogs((prev) => [createdLog, ...prev]);

    // If pre-dose BG was entered, also record as glucose reading
    if (newLogData.glucoseBefore) {
      const newReading: GlucoseReading = {
        id: `bg-${Date.now()}`,
        timestamp,
        value: newLogData.glucoseBefore,
        context:
          newLogData.mealSlot === 'breakfast'
            ? 'before_breakfast'
            : newLogData.mealSlot === 'lunch'
            ? 'before_lunch'
            : newLogData.mealSlot === 'dinner'
            ? 'before_dinner'
            : 'bedtime',
        notes: `Checked prior to ${newLogData.units}u ${newLogData.insulinBrand} shot`,
      };
      setReadings((prev) => [...prev, newReading]);
    }

    // Mark corresponding task completed if applicable
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                isCompleted: true,
                completedAt: timestamp,
                actualUnits: newLogData.units,
                injectionSite: newLogData.injectionSite,
                bloodGlucose: newLogData.glucoseBefore,
                notes: newLogData.notes,
              }
            : t
        )
      );
    }
  };

  const handleSaveGlucose = (newReading: Omit<GlucoseReading, 'id' | 'timestamp'>) => {
    const created: GlucoseReading = {
      ...newReading,
      id: `bg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setReadings((prev) => [...prev, created]);
  };

  const handleAddTask = (newTask: Omit<InsulinTask, 'id' | 'isCompleted'>) => {
    const created: InsulinTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      isCompleted: false,
    };
    setTasks((prev) => [...prev, created]);
  };

  const handleAddReminder = (newRem: Omit<DailyReminder, 'id'>) => {
    const created: DailyReminder = {
      ...newRem,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [...prev, created]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleToggleSound = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, snoozedUntil: snoozeTime } : r))
    );
    setActiveAlarmToast(null);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDeleteReading = (id: string) => {
    setReadings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReloadDemoData = () => {
    const seed = generateSeedData();
    setLogs(seed.logs);
    setReadings(seed.readings);
    setTasks(DEFAULT_TASKS);
    setReminders(DEFAULT_REMINDERS);
    setProfile(DEFAULT_PROFILE);
    setShowSettings(false);
  };

  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const activeRemindersCount = reminders.filter((r) => r.enabled).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Active Alarm Floating Toast */}
      {activeAlarmToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 text-white border-2 border-indigo-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl animate-pulse text-white">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Scheduled Dose Alarm ({activeAlarmToast.time})
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {activeAlarmToast.label}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Time for your scheduled insulin injection or glucose check.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setActiveAlarmToast(null);
                    setShowLogShot(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
                >
                  Take Now
                </button>
                <button
                  onClick={() => handleSnoozeReminder(activeAlarmToast.id, 15)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Snooze 15m
                </button>
                <button
                  onClick={() => setActiveAlarmToast(null)}
                  className="text-xs text-slate-400 hover:text-white ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogShot={() => {
          setPreselectedTask(null);
          setShowLogShot(true);
        }}
        onOpenLogGlucose={() => setShowLogGlucose(true)}
        onOpenDoctorReport={() => setShowDoctorReport(true)}
        onOpenChemx={() => setShowChemx(true)}
        onOpenSettings={() => setShowSettings(true)}
        tasksCompleted={completedTasksCount}
        tasksTotal={tasks.length}
        activeRemindersCount={activeRemindersCount}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tasks' && (
          <InsulinTaskManager
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenLogShot={(task) => {
              setPreselectedTask(task || null);
              setShowLogShot(true);
            }}
            onOpenSiteGuide={() => setShowSiteGuide(true)}
            recommendedSite={recommendedSite}
            lastUsedSite={lastUsedSite}
            recentLogs={logs}
            profile={profile}
            onAddTask={handleAddTask}
          />
        )}

        {activeTab === 'glucose' && (
          <GlucoseDashboard
            readings={readings}
            profile={profile}
            onOpenLogGlucose={() => setShowLogGlucose(true)}
          />
        )}

        {activeTab === 'reminders' && (
          <DailyReminders
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onToggleSound={handleToggleSound}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onSnoozeReminder={handleSnoozeReminder}
          />
        )}

        {activeTab === 'logs' && (
          <HistoricalLogs
            logs={logs}
            readings={readings}
            profile={profile}
            onDeleteLog={handleDeleteLog}
            onDeleteReading={handleDeleteReading}
            onOpenLogShot={() => {
              setPreselectedTask(null);
              setShowLogShot(true);
            }}
            onOpenLogGlucose={() => setShowLogGlucose(true)}
          />
        )}
      </main>

      {/* Subtle Clinical Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Diabetic Tracker v0
            </span>{' '}
            • Enhanced by ChemX SQLite Task Architecture
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDoctorReport(true)}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Export Doctor Visit Report
            </button>
            <span>•</span>
            <button
              onClick={() => setShowChemx(true)}
              className="text-slate-500 hover:text-teal-500"
            >
              ChemX Telemetry
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LogShotModal
        isOpen={showLogShot}
        onClose={() => {
          setShowLogShot(false);
          setPreselectedTask(null);
        }}
        onSave={handleSaveShot}
        profile={profile}
        recommendedSite={recommendedSite}
        preselectedTask={preselectedTask}
      />

      <LogGlucoseModal
        isOpen={showLogGlucose}
        onClose={() => setShowLogGlucose(false)}
        onSave={handleSaveGlucose}
        profile={profile}
      />

      <InjectionSiteModal
        isOpen={showSiteGuide}
        onClose={() => setShowSiteGuide(false)}
        recommendedSite={recommendedSite}
        lastUsedSite={lastUsedSite}
        recentLogs={logs}
      />

      <DoctorReportModal
        isOpen={showDoctorReport}
        onClose={() => setShowDoctorReport(false)}
        profile={profile}
        logs={logs}
        readings={readings}
      />

      <ChemxPanel
        isOpen={showChemx}
        onClose={() => setShowChemx(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onReloadSeedData={handleReloadDemoData}
      />
    </div>
  );
}
