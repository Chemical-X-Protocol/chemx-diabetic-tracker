import React from 'react';
import { X, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { InjectionSite, INJECTION_SITES, InsulinLog } from '../types/diabetic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recommendedSite: InjectionSite;
  lastUsedSite?: InjectionSite;
  recentLogs: InsulinLog[];
  onSelectSite?: (site: InjectionSite) => void;
}

export const InjectionSiteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  recommendedSite,
  lastUsedSite,
  recentLogs,
  onSelectSite,
}) => {
  if (!isOpen) return null;

  // Compute how many times each site has been used in recent 20 logs
  const siteUsageCount: Record<string, number> = {};
  const siteLastDate: Record<string, string> = {};

  recentLogs.slice(0, 30).forEach((l) => {
    siteUsageCount[l.injectionSite] = (siteUsageCount[l.injectionSite] || 0) + 1;
    if (!siteLastDate[l.injectionSite]) {
      siteLastDate[l.injectionSite] = new Date(l.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-lg">
              <MapPin className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Injection Site Rotation Guide</h2>
              <p className="text-xs text-emerald-100">Prevent lipohypertrophy & maximize absorption consistency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Clinical Tip Banner */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                Why rotate sites at every injection?
              </p>
              <p>
                Injecting into the same area causes subcutaneous fatty lumps (lipohypertrophy), which delays insulin absorption and causes erratic blood glucose swings. Rotate systematically across your abdomen, thighs, arms, and glutes.
              </p>
            </div>
          </div>

          {/* Interactive Site Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Anatomical Rotation Map (10 Zones)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INJECTION_SITES.map((site) => {
                const isRecommended = site.id === recommendedSite;
                const isLastUsed = site.id === lastUsedSite;
                const usage = siteUsageCount[site.id] || 0;
                const lastDate = siteLastDate[site.id];

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      if (onSelectSite) {
                        onSelectSite(site.id);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isRecommended
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : isLastUsed
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {site.name}
                          </span>
                          {isRecommended && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white flex items-center gap-0.5">
                              <CheckCircle className="w-2.5 h-2.5" /> Next Best
                            </span>
                          )}
                          {isLastUsed && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500 text-white">
                              Last Injected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {site.description}
                        </p>
                      </div>

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {site.category}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                      <span>Doses in past 30: <strong className="text-slate-800 dark:text-slate-200">{usage}</strong></span>
                      {lastDate && <span>Last used: {lastDate}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
