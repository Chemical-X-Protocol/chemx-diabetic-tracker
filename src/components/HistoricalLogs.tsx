import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Syringe,
  Activity,
  AlertTriangle,
  Calendar,
  Trash2,
  Plus,
  MapPin,
} from 'lucide-react';
import {
  GlucoseReading,
  InjectionSite,
  INJECTION_SITES,
  InsulinLog,
  UserProfile,
} from '../types/diabetic';

interface Props {
  logs: InsulinLog[];
  readings: GlucoseReading[];
  profile: UserProfile;
  onDeleteLog: (id: string) => void;
  onDeleteReading: (id: string) => void;
  onOpenLogShot: () => void;
  onOpenLogGlucose: () => void;
}

export const HistoricalLogs: React.FC<Props> = ({
  logs,
  readings,
  profile,
  onDeleteLog,
  onDeleteReading,
  onOpenLogShot,
  onOpenLogGlucose,
}) => {
  const [tabFilter, setTabFilter] = useState<'all' | 'insulin' | 'glucose' | 'hypo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayRange, setDayRange] = useState<7 | 14 | 30 | 90 | 365>(30);

  const cutoff = new Date(Date.now() - dayRange * 24 * 3600 * 1000);

  // Combine logs and readings into unified timeline
  type TimelineItem =
    | { type: 'insulin'; data: InsulinLog; timestamp: string }
    | { type: 'glucose'; data: GlucoseReading; timestamp: string };

  const timelineItems: TimelineItem[] = [
    ...logs
      .filter((l) => new Date(l.timestamp) >= cutoff)
      .map((l) => ({ type: 'insulin' as const, data: l, timestamp: l.timestamp })),
    ...readings
      .filter((r) => new Date(r.timestamp) >= cutoff)
      .map((r) => ({ type: 'glucose' as const, data: r, timestamp: r.timestamp })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply tab filter & search
  const filteredItems = timelineItems.filter((item) => {
    if (tabFilter === 'insulin' && item.type !== 'insulin') return false;
    if (tabFilter === 'glucose' && item.type !== 'glucose') return false;
    if (tabFilter === 'hypo') {
      if (item.type === 'glucose' && item.data.value >= profile.targetRangeLow) return false;
      if (item.type === 'insulin' && (!item.data.glucoseBefore || item.data.glucoseBefore >= profile.targetRangeLow)) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (item.type === 'insulin') {
        const siteName = INJECTION_SITES.find((s) => s.id === item.data.injectionSite)?.name || '';
        return (
          item.data.insulinBrand.toLowerCase().includes(q) ||
          item.data.notes.toLowerCase().includes(q) ||
          item.data.taskTitle.toLowerCase().includes(q) ||
          siteName.toLowerCase().includes(q)
        );
      } else {
        return (
          item.data.context.toLowerCase().includes(q) ||
          (item.data.notes || '').toLowerCase().includes(q)
        );
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Historical Logs Diary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit trail of all administered insulin shots and blood glucose scans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLogShot}
            className="px-3 py-2 text-xs font-bold rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
          >
            <Syringe className="w-3.5 h-3.5" /> + Log Shot
          </button>
          <button
            onClick={onOpenLogGlucose}
            className="px-3 py-2 text-xs font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" /> + Log Glucose
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'insulin', label: 'Insulin Only' },
            { id: 'glucose', label: 'Glucose Only' },
            { id: 'hypo', label: '⚠️ Hypo (<70)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                tabFilter === tab.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Date Range */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, brand, site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={dayRange}
            onChange={(e) => setDayRange(Number(e.target.value) as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value={7}>Past 7 Days</option>
            <option value={14}>Past 14 Days</option>
            <option value={30}>Past 30 Days</option>
            <option value={90}>Past 90 Days</option>
            <option value={365}>All Recorded</option>
          </select>
        </div>
      </div>

      {/* Diary Timeline Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing {filteredItems.length} records</span>
          <span>Sorted newest first</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">No records found matching filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your date range or clear search</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => {
              const dt = new Date(item.timestamp);
              const dateStr = dt.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              if (item.type === 'insulin') {
                const log = item.data;
                const site = INJECTION_SITES.find((s) => s.id === log.injectionSite)?.name || log.injectionSite;

                return (
                  <div
                    key={`ins-${log.id}`}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0 mt-0.5">
                        <Syringe className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {log.taskTitle || `${log.mealSlot} Shot`}
                          </span>
                          <span className="text-xs font-black text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950">
                            {log.units} Units
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {log.insulinType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{log.insulinBrand}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            {site}
                          </span>

                          {log.glucoseBefore && (
                            <>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  log.glucoseBefore < profile.targetRangeLow
                                    ? 'text-rose-600'
                                    : log.glucoseBefore > profile.targetRangeHigh
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                Pre-BG: {log.glucoseBefore} {profile.glucoseUnit}
                              </span>
                            </>
                          )}

                          {log.carbsGrams && (
                            <>
                              <span>•</span>
                              <span>Carbs: {log.carbsGrams}g</span>
                            </>
                          )}
                        </div>

                        {log.notes && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 self-stretch sm:self-center">
                      <div className="text-left sm:text-right">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block">{dateStr}</span>
                        <span className="text-[11px] block">{timeStr}</span>
                      </div>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              } else {
                const reading = item.data;
                const isHypo = reading.value < profile.targetRangeLow;
                const isHyper = reading.value > profile.targetRangeHigh;

                return (
                  <div
                    key={`bg-${reading.id}`}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                      isHypo ? 'bg-rose-50/30 dark:bg-rose-950/15' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          isHypo
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950'
                            : isHyper
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60'
                        }`}
                      >
                        {isHypo ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-base font-black ${
                              isHypo ? 'text-rose-600' : isHyper ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {reading.value} {profile.glucoseUnit}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                            {reading.context.replace(/_/g, ' ')}
                          </span>
                          {isHypo && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                              HYPOGLYCEMIA
                            </span>
                          )}
                        </div>

                        {reading.notes && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {reading.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 self-stretch sm:self-center">
                      <div className="text-left sm:text-right">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block">{dateStr}</span>
                        <span className="text-[11px] block">{timeStr}</span>
                      </div>
                      <button
                        onClick={() => onDeleteReading(reading.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
