import React, { useState } from 'react';
import { X, Syringe, MapPin, Check, AlertCircle } from 'lucide-react';
import {
  InjectionSite,
  INJECTION_SITES,
  InsulinLog,
  InsulinTask,
  InsulinType,
  MealSlot,
  UserProfile,
} from '../types/diabetic';
import { playChimeSound } from '../lib/audioAlert';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<InsulinLog, 'id' | 'timestamp'>, taskId?: string) => void;
  profile: UserProfile;
  recommendedSite: InjectionSite;
  preselectedTask?: InsulinTask | null;
}

export const LogShotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  profile,
  recommendedSite,
  preselectedTask,
}) => {
  if (!isOpen) return null;

  const [taskTitle, setTaskTitle] = useState(preselectedTask?.title || 'Meal Bolus');
  const [mealSlot, setMealSlot] = useState<MealSlot>(preselectedTask?.timeSlot || 'breakfast');
  const [insulinBrand, setInsulinBrand] = useState(
    preselectedTask?.insulinBrand ||
      (mealSlot === 'breakfast' && preselectedTask?.insulinType === 'long'
        ? profile.preferredBasalBrand
        : profile.preferredBolusBrand)
  );
  const [insulinType, setInsulinType] = useState<InsulinType>(preselectedTask?.insulinType || 'rapid');
  const [units, setUnits] = useState<number>(preselectedTask?.defaultUnits ?? 6);
  const [injectionSite, setInjectionSite] = useState<InjectionSite>(
    preselectedTask?.injectionSite || recommendedSite
  );
  const [glucoseBefore, setGlucoseBefore] = useState<string>('');
  const [carbsGrams, setCarbsGrams] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (units <= 0) return;

    onSave(
      {
        taskTitle,
        insulinBrand,
        insulinType,
        units,
        injectionSite,
        glucoseBefore: glucoseBefore ? Number(glucoseBefore) : undefined,
        carbsGrams: carbsGrams ? Number(carbsGrams) : undefined,
        mealSlot,
        notes: notes.trim(),
      },
      preselectedTask?.id
    );

    playChimeSound('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-lg">
              <Syringe className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Insulin Shot</h2>
              <p className="text-xs text-teal-100">Log dose, units & injection site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Dose title / meal slot */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Meal Slot & Purpose
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['breakfast', 'lunch', 'dinner', 'bedtime', 'correction'] as MealSlot[]).map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => {
                    setMealSlot(slot);
                    if (slot === 'bedtime') {
                      setTaskTitle('Bedtime Basal');
                      setInsulinBrand(profile.preferredBasalBrand);
                      setInsulinType('long');
                    } else if (slot === 'correction') {
                      setTaskTitle('Correction Dose');
                      setInsulinBrand(profile.preferredBolusBrand);
                      setInsulinType('rapid');
                    } else {
                      setTaskTitle(`${slot.charAt(0).toUpperCase() + slot.slice(1)} Bolus`);
                      setInsulinBrand(profile.preferredBolusBrand);
                      setInsulinType('rapid');
                    }
                  }}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                    mealSlot === slot
                      ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Insulin Brand & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Insulin Medication
              </label>
              <input
                type="text"
                required
                value={insulinBrand}
                onChange={(e) => setInsulinBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Humalog, Lantus"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Action Type
              </label>
              <select
                value={insulinType}
                onChange={(e) => setInsulinType(e.target.value as InsulinType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="rapid">Rapid-Acting (Humalog / Novolog)</option>
                <option value="ultra_rapid">Ultra-Rapid (Fiasp / Lyumjev)</option>
                <option value="long">Long-Acting / Basal (Lantus / Tresiba)</option>
                <option value="intermediate">Intermediate (NPH)</option>
                <option value="pre_mixed">Pre-Mixed (70/30)</option>
              </select>
            </div>
          </div>

          {/* Units Stepper */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Units Administered
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setUnits((u) => Math.max(0.5, Number((u - 1).toFixed(1))))}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-100 shadow-xs"
              >
                -
              </button>
              <div className="text-center">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="150"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-24 text-center font-black text-3xl text-teal-600 dark:text-teal-400 bg-transparent border-b-2 border-teal-500 focus:outline-hidden"
                />
                <span className="block text-xs font-medium text-slate-500">Units</span>
              </div>
              <button
                type="button"
                onClick={() => setUnits((u) => Number((u + 1).toFixed(1)))}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Injection Site Picker & Rotation Alert */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Injection Site Rotation
              </label>
              {recommendedSite === injectionSite && (
                <span className="text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Recommended Site
                </span>
              )}
            </div>
            <select
              value={injectionSite}
              onChange={(e) => setInjectionSite(e.target.value as InjectionSite)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {INJECTION_SITES.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.category}) {site.id === recommendedSite ? '⭐ [Recommended]' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Rotating injection sites protects subcutaneous tissue from lipohypertrophy (lumps) and maintains predictable insulin absorption.
            </p>
          </div>

          {/* Pre-dose BG & Carbs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Pre-Dose BG ({profile.glucoseUnit})
              </label>
              <input
                type="number"
                value={glucoseBefore}
                onChange={(e) => setGlucoseBefore(e.target.value)}
                placeholder="e.g. 115"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Carbs Consumed (g)
              </label>
              <input
                type="number"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Meal Notes & Symptoms
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Grilled chicken salad, light workout scheduled"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
              className="px-5 py-2 text-sm font-bold rounded-lg text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Shot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
