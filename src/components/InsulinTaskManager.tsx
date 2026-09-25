import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  MapPin,
  Clock,
  Syringe,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  InjectionSite,
  INJECTION_SITES,
  InsulinLog,
  InsulinTask,
  UserProfile,
} from '../types/diabetic';

interface Props {
  tasks: InsulinTask[];
  onToggleTask: (taskId: string) => void;
  onOpenLogShot: (task?: InsulinTask) => void;
  onOpenSiteGuide: () => void;
  recommendedSite: InjectionSite;
  lastUsedSite?: InjectionSite;
  recentLogs: InsulinLog[];
  profile: UserProfile;
  onAddTask: (task: Omit<InsulinTask, 'id' | 'isCompleted'>) => void;
}

export const InsulinTaskManager: React.FC<Props> = ({
  tasks,
  onToggleTask,
  onOpenLogShot,
  onOpenSiteGuide,
  recommendedSite,
  lastUsedSite,
  recentLogs,
  profile,
  onAddTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState(profile.preferredBolusBrand);
  const [newType, setNewType] = useState<'rapid' | 'long' | 'intermediate' | 'ultra_rapid'>('rapid');
  const [newUnits, setNewUnits] = useState(6);
  const [newTime, setNewTime] = useState('14:00');
  const [newSlot, setNewSlot] = useState<'breakfast' | 'lunch' | 'dinner' | 'bedtime' | 'snack'>('snack');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const recSiteInfo = INJECTION_SITES.find((s) => s.id === recommendedSite);
  const lastSiteInfo = INJECTION_SITES.find((s) => s.id === lastUsedSite);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      scheduledTime: newTime,
      insulinBrand: newBrand.trim(),
      insulinType: newType,
      defaultUnits: newUnits,
      timeSlot: newSlot,
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Adherence & Site Rotation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Adherence Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Insulin Schedule
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{completedCount} of {totalCount} Doses Completed</span>
                {progressPct === 100 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                    All Done! 🎉
                  </span>
                )}
              </h2>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">14-Day Streak</span>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">100% dose compliance</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{progressPct}% of daily regimen administered</span>
            <span>{totalCount - completedCount} doses remaining today</span>
          </div>
        </div>

        {/* Injection Site Recommendation Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Site Rotation Guide
              </span>
              <button
                onClick={onOpenSiteGuide}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center"
              >
                View Map <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
              Next recommended injection site:
            </p>
            <p className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              {recSiteInfo?.name || 'Left Outer Thigh'}
            </p>
            {lastSiteInfo && (
              <p className="text-[11px] text-slate-500 mt-1">
                Last injected: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSiteInfo.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={onOpenSiteGuide}
            className="mt-3 w-full py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-lg hover:bg-emerald-200/80 transition-colors"
          >
            Check 10 Anatomical Zones
          </button>
        </div>
      </div>

      {/* Daily Task List Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Dose Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap the checkmark to record a completed shot or log details
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Dose Task
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-90'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-300 dark:hover:border-teal-600'
                }`}
              >
                {/* Left check and info */}
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => {
                      if (!isDone) {
                        onOpenLogShot(task);
                      } else {
                        onToggleTask(task.id);
                      }
                    }}
                    className={`mt-0.5 shrink-0 transition-transform active:scale-95 ${
                      isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-teal-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isDone
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {task.scheduledTime}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          task.insulinType === 'long'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {task.insulinType === 'long' ? 'Basal' : 'Bolus'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{task.insulinBrand}</span>
                      <span>•</span>
                      <span>Target: <strong className="text-slate-700 dark:text-slate-200">{task.defaultUnits} Units</strong></span>

                      {isDone && task.actualUnits && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Administered: {task.actualUnits} Units
                          </span>
                        </>
                      )}

                      {isDone && task.injectionSite && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            {INJECTION_SITES.find((s) => s.id === task.injectionSite)?.name || task.injectionSite}
                          </span>
                        </>
                      )}

                      {isDone && task.completedAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>

                    {isDone && task.notes && (
                      <p className="mt-1 text-xs text-slate-500 italic">"{task.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Right action button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!isDone ? (
                    <button
                      onClick={() => onOpenLogShot(task)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Syringe className="w-3.5 h-3.5" /> Mark Taken
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Dose Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add New Daily Dose Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Task Label / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Snack Bolus"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Meal / Purpose
                  </label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="bedtime">Bedtime</option>
                    <option value="snack">Snack / Correction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Insulin Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Default Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
