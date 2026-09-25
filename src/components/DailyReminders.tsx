import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { DailyReminder, MealSlot } from '../types/diabetic';
import { playChimeSound } from '../lib/audioAlert';

interface Props {
  reminders: DailyReminder[];
  onToggleReminder: (id: string) => void;
  onToggleSound: (id: string) => void;
  onAddReminder: (reminder: Omit<DailyReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
}

export const DailyReminders: React.FC<Props> = ({
  reminders,
  onToggleReminder,
  onToggleSound,
  onAddReminder,
  onDeleteReminder,
  onSnoozeReminder,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('12:00');
  const [newSlot, setNewSlot] = useState<MealSlot>('lunch');
  const [newSound, setNewSound] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    onAddReminder({
      label: newLabel.trim(),
      time: newTime,
      mealSlot: newSlot,
      enabled: true,
      soundEnabled: newSound,
    });

    setNewLabel('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Live Clock & Quick Action */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Clock className="w-3 h-3" /> Live Clock
            </span>
            <span className="font-mono text-xs text-indigo-300">{currentTimeStr}</span>
          </div>
          <h2 className="text-xl font-bold">Daily Dose Alarms & Reminders</h2>
          <p className="text-xs text-indigo-200">
            Gentle hospital-grade audio chime and visual cues to ensure zero missed insulin injections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playChimeSound('reminder')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
            title="Play sample clinical alert chime"
          >
            <Play className="w-3.5 h-3.5" /> Test Audio Chime
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Alarm
          </button>
        </div>
      </div>

      {/* Missed Dose Protocol Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-200">
            Endocrinologist Safety Guidance: What if you miss a dose?
          </p>
          <p>
            <strong>Never take a double dose of basal insulin</strong> to make up for a missed injection. If you forget mealtime rapid-acting insulin, check blood glucose immediately and follow your clinician's correction bolus protocol.
          </p>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Configured Daily Schedules ({reminders.length})
        </h3>

        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                rem.enabled
                  ? 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    rem.enabled
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {rem.label}
                    </span>
                    <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {rem.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="capitalize">{rem.mealSlot} window</span>
                    <span>•</span>
                    <span>{rem.soundEnabled ? 'Chime sound active' : 'Silent notification'}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Snooze button */}
                {rem.enabled && (
                  <button
                    onClick={() => onSnoozeReminder(rem.id, 15)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    title="Snooze 15 minutes"
                  >
                    <RotateCcw className="w-3 h-3" /> Snooze 15m
                  </button>
                )}

                {/* Sound Toggle */}
                <button
                  onClick={() => onToggleSound(rem.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    rem.soundEnabled
                      ? 'text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-800'
                      : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                  title={rem.soundEnabled ? 'Disable chime' : 'Enable chime'}
                >
                  {rem.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Enable/Disable switch */}
                <button
                  onClick={() => onToggleReminder(rem.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    rem.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {rem.enabled ? 'Active' : 'Off'}
                </button>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Remove alarm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Dose Reminder Alarm
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Alarm Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Glucose Scan & Bolus"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Meal Context
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value as MealSlot)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="bedtime">Bedtime</option>
                    <option value="snack">Snack / Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soundCheck"
                  checked={newSound}
                  onChange={(e) => setNewSound(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="soundCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Play gentle medical chime sound on trigger
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
