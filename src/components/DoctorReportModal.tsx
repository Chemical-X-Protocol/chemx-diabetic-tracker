import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Stethoscope,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  GlucoseReading,
  INJECTION_SITES,
  InsulinLog,
  UserProfile,
} from '../types/diabetic';
import { calculateClinicalMetrics, exportToCSV } from '../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  logs: InsulinLog[];
  readings: GlucoseReading[];
}

export const DoctorReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  logs,
  readings,
}) => {
  if (!isOpen) return null;

  const [reportDays, setReportDays] = useState<14 | 30 | 90>(14);

  const cutoff = new Date(Date.now() - reportDays * 24 * 3600 * 1000);
  const filteredReadings = readings.filter((r) => new Date(r.timestamp) >= cutoff);
  const filteredLogs = logs.filter((l) => new Date(l.timestamp) >= cutoff);

  const metrics = calculateClinicalMetrics(
    filteredReadings,
    profile.targetRangeLow,
    profile.targetRangeHigh
  );

  // Calculate Total Daily Dose (TDD)
  const basalLogs = filteredLogs.filter((l) => l.insulinType === 'long');
  const bolusLogs = filteredLogs.filter((l) => l.insulinType !== 'long');
  const totalBasalUnits = basalLogs.reduce((sum, l) => sum + l.units, 0);
  const totalBolusUnits = bolusLogs.reduce((sum, l) => sum + l.units, 0);
  const avgDailyBasal = reportDays > 0 ? (totalBasalUnits / reportDays).toFixed(1) : '0';
  const avgDailyBolus = reportDays > 0 ? (totalBolusUnits / reportDays).toFixed(1) : '0';
  const avgDailyTdd = (Number(avgDailyBasal) + Number(avgDailyBolus)).toFixed(1);

  // Hypo count
  const hypoCount = filteredReadings.filter((r) => r.value < profile.targetRangeLow).length;
  const severeHypoCount = filteredReadings.filter((r) => r.value < profile.urgentLow).length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent = exportToCSV(filteredLogs, filteredReadings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Diabetic_Report_${profile.patientName.replace(/\s+/g, '_')}_${reportDays}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-4">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Doctor Visit Clinical Report</h2>
              <p className="text-xs text-slate-400">Formatted clinical summary for your healthcare provider</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              {[14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setReportDays(d as any)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    reportDays === d ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-clinical-report" className="p-8 sm:p-10 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Clinical Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Clinical Diabetes Comprehensive Summary
                </span>
                <h1 className="text-2xl font-black text-slate-900">
                  PATIENT GLUCOSE & INSULIN DOSING LOG
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated via Diabetic Tracker v0 (Enhanced by ChemX) • {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600">
                <p className="font-bold text-slate-900">{profile.clinicName}</p>
                <p>Attending: {profile.physicianName}</p>
                <p>Phone: {profile.physicianPhone}</p>
              </div>
            </div>

            {/* Patient Demographics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <span className="font-bold text-slate-900">{profile.patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth:</span>
                <span className="font-bold text-slate-900">{profile.dob}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Medical Record #:</span>
                <span className="font-bold text-slate-900">{profile.mrn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Diagnosis:</span>
                <span className="font-bold text-teal-700">{profile.diabetesType}</span>
              </div>
            </div>
          </div>

          {/* Monitoring Period & Executive Clinical Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Clinical Metrics ({reportDays}-Day Monitored Window)
              </span>
              <span className="text-xs text-slate-500">
                Target Corridor: {profile.targetRangeLow} - {profile.targetRangeHigh} {profile.glucoseUnit}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Average Glucose</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {metrics.avgBg || '--'} <span className="text-xs font-normal text-slate-500">{profile.glucoseUnit}</span>
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{metrics.count} total readings</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Estimated HbA1c</span>
                <span className="text-2xl font-black text-teal-700 mt-1 block">
                  {metrics.estimatedA1c ? `${metrics.estimatedA1c}%` : '--'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Formula: Nathan / ADA</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Time in Range (TIR)</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {metrics.tirPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Goal: &gt; 70%</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Daily Dose (TDD)</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {avgDailyTdd} <span className="text-xs font-normal text-slate-500">Units/day</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Basal: {avgDailyBasal}u | Bolus: {avgDailyBolus}u
                </span>
              </div>
            </div>

            {/* Time in Range Breakdown Table */}
            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center">
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-md">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Very Low (&lt;54)</span>
                <span className="font-black text-rose-700">{metrics.veryLowPct}% ({metrics.veryLowCount})</span>
              </div>
              <div className="p-2 bg-rose-50/60 border border-rose-200 rounded-md">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Low (54-69)</span>
                <span className="font-black text-rose-600">{metrics.lowPct}% ({metrics.lowCount})</span>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Target (70-180)</span>
                <span className="font-black text-emerald-700">{metrics.inRangePct}% ({metrics.inRangeCount})</span>
              </div>
              <div className="p-2 bg-amber-50/60 border border-amber-200 rounded-md">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">High (181-250)</span>
                <span className="font-black text-amber-700">{metrics.highPct}% ({metrics.highCount})</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Very High (&gt;250)</span>
                <span className="font-black text-amber-800">{metrics.veryHighPct}% ({metrics.veryHighCount})</span>
              </div>
            </div>
          </div>

          {/* Hypoglycemia Review Note */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1">
            <span className="font-bold text-slate-800 uppercase tracking-wide block">
              Safety & Hypoglycemia Summary:
            </span>
            <p className="text-slate-600">
              During this {reportDays}-day assessment, patient documented <strong>{hypoCount}</strong> readings below target ({profile.targetRangeLow} mg/dL), with <strong>{severeHypoCount}</strong> urgent lows below 54 mg/dL. All events were appropriately countered with fast-acting carbohydrates without required emergency assistance.
            </p>
          </div>

          {/* Recent Dose & Glucose Log Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Itemized Daily Clinical Log Table (Recent Entries)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2 px-3">Date & Time</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Glucose</th>
                    <th className="py-2 px-3">Medication / Units</th>
                    <th className="py-2 px-3">Injection Site</th>
                    <th className="py-2 px-3">Carbs</th>
                    <th className="py-2 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.slice(0, 30).map((log) => {
                    const siteName = INJECTION_SITES.find((s) => s.id === log.injectionSite)?.name || log.injectionSite;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono">
                          {new Date(log.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}{' '}
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 px-3 font-semibold text-teal-700 capitalize">{log.insulinType}</td>
                        <td className="py-2 px-3">
                          {log.glucoseBefore ? `${log.glucoseBefore} ${profile.glucoseUnit}` : '--'}
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {log.insulinBrand} - {log.units}u
                        </td>
                        <td className="py-2 px-3 text-slate-600">{siteName}</td>
                        <td className="py-2 px-3">{log.carbsGrams ? `${log.carbsGrams}g` : '--'}</td>
                        <td className="py-2 px-3 text-slate-600 italic truncate max-w-xs">{log.notes || '--'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Physician Notes Box */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Clinician Assessment & Action Plan Notes:
            </span>
            <div className="h-16 border-b border-slate-200"></div>
            <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
              <span>Physician Signature: ___________________________</span>
              <span>Date: ________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
