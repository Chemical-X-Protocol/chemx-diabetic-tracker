import React, { useState } from 'react';
import { X, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { GlucoseContext, GlucoseReading, UserProfile } from '../types/diabetic';
import { playChimeSound } from '../lib/audioAlert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reading: Omit<GlucoseReading, 'id' | 'timestamp'>) => void;
  profile: UserProfile;
}

const CONTEXT_OPTIONS: { value: GlucoseContext; label: string }[] = [
  { value: 'fasting', label: 'Waking / Fasting' },
  { value: 'before_breakfast', label: 'Before Breakfast' },
  { value: 'after_breakfast', label: 'After Breakfast (2 hr)' },
  { value: 'before_lunch', label: 'Before Lunch' },
  { value: 'after_lunch', label: 'After Lunch (2 hr)' },
  { value: 'before_dinner', label: 'Before Dinner' },
  { value: 'after_dinner', label: 'After Dinner (2 hr)' },
  { value: 'bedtime', label: 'Bedtime Check' },
  { value: 'night', label: 'Overnight (3 AM)' },
  { value: 'post_exercise', label: 'Post-Workout / Activity' },
  { value: 'symptoms', label: 'Hypo / Hyper Symptoms' },
];

export const LogGlucoseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  profile,
}) => {
  if (!isOpen) return null;

  const [value, setValue] = useState<string>('115');
  const [context, setContext] = useState<GlucoseContext>('fasting');
  const [notes, setNotes] = useState<string>('');

  const numVal = Number(value) || 0;
  const isHypo = numVal > 0 && numVal < profile.targetRangeLow;
  const isUrgentLow = numVal > 0 && numVal <= profile.urgentLow;
  const isHyper = numVal > profile.targetRangeHigh;
  const isUrgentHigh = numVal >= profile.urgentHigh;
  const isInRange = numVal >= profile.targetRangeLow && numVal <= profile.targetRangeHigh;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numVal <= 10 || numVal > 600) return;

    onSave({
      value: numVal,
      context,
      notes: notes.trim(),
    });

    if (isHypo) {
      playChimeSound('alert');
    } else {
      playChimeSound('success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-lg">
              <Activity className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Log Blood Glucose</h2>
              <p className="text-xs text-blue-100">Record current sensor or fingerstick reading</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Blood Glucose Number Input */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Blood Glucose ({profile.glucoseUnit})
            </label>
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                min="20"
                max="600"
                required
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`w-36 text-center font-black text-4xl bg-transparent border-b-3 focus:outline-hidden transition-colors ${
                  isUrgentLow || isHypo
                    ? 'text-rose-600 border-rose-500'
                    : isHyper
                    ? 'text-amber-600 border-amber-500'
                    : 'text-emerald-600 border-emerald-500'
                }`}
              />
              <span className="text-sm font-semibold text-slate-500">{profile.glucoseUnit}</span>
            </div>

            {/* Live Clinical Tag */}
            <div className="mt-3 flex justify-center">
              {isUrgentLow ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> URGENT LOW (Under {profile.urgentLow})
                </span>
              ) : isHypo ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Below Target Range (&lt; {profile.targetRangeLow})
                </span>
              ) : isUrgentHigh ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> URGENT HIGH (&gt; {profile.urgentHigh})
                </span>
              ) : isHyper ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" /> Above Target Range (&gt; {profile.targetRangeHigh})
                </span>
              ) : isInRange ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5" /> In Target Range ({profile.targetRangeLow} - {profile.targetRangeHigh})
                </span>
              ) : null}
            </div>
          </div>

          {/* Clinical Guidance Box for Hypo / Extreme High */}
          {isHypo && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Clinical Guidance: The 15-15 Rule</p>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                  Consume 15g of fast-acting carbohydrate (e.g. 4 oz juice or 3-4 glucose tablets). Wait 15 minutes and re-test.
                </p>
              </div>
            </div>
          )}

          {isUrgentHigh && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Severe Hyperglycemia Advisory</p>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                  Drink plenty of water. Check blood/urine ketones if reading persists above {profile.urgentHigh} mg/dL. Contact care team if feeling unwell.
                </p>
              </div>
            </div>
          )}

          {/* Context Timing */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Context / Timing
            </label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value as GlucoseContext)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {CONTEXT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes & Symptoms (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting sensor scan, feeling energized"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
