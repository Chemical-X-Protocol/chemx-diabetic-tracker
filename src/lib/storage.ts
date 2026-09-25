import {
  DailyReminder,
  GlucoseReading,
  InjectionSite,
  INJECTION_SITES,
  InsulinLog,
  InsulinTask,
  UserProfile,
} from '../types/diabetic';

const STORAGE_KEYS = {
  PROFILE: 'diabetic_tracker_profile_v1',
  TASKS: 'diabetic_tracker_tasks_v1',
  LOGS: 'diabetic_tracker_logs_v1',
  READINGS: 'diabetic_tracker_readings_v1',
  REMINDERS: 'diabetic_tracker_reminders_v1',
  LAST_DATE: 'diabetic_tracker_last_date_v1',
  PROJECT_METRICS: 'diabetic_tracker_project_metrics_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  patientName: 'Alex Morgan',
  dob: '1989-04-12',
  mrn: 'MRN-782491',
  diabetesType: 'Type 1',
  physicianName: 'Dr. Sarah Jenkins, MD',
  clinicName: 'Cascade Diabetes & Endocrinology Clinic',
  physicianPhone: '(555) 234-8901',
  physicianEmail: 'dr.jenkins@cascadeendocrinology.org',
  targetRangeLow: 70,
  targetRangeHigh: 180,
  fastingTargetLow: 70,
  fastingTargetHigh: 130,
  urgentLow: 54,
  urgentHigh: 250,
  glucoseUnit: 'mg/dL',
  preferredBasalBrand: 'Lantus (Glargine)',
  preferredBolusBrand: 'Humalog (Lispro)',
  carbRatio: 10, // 1 unit per 10g carbs
  correctionFactor: 40, // 1 unit drops 40 mg/dL
};

export const DEFAULT_TASKS: InsulinTask[] = [
  {
    id: 'task-1',
    title: 'Morning Basal Injection',
    timeSlot: 'breakfast',
    scheduledTime: '07:30',
    insulinBrand: 'Lantus (Glargine)',
    insulinType: 'long',
    defaultUnits: 22,
    isCompleted: true,
    completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    actualUnits: 22,
    injectionSite: 'thigh_right',
    bloodGlucose: 108,
    notes: 'Smooth injection, woke up feeling good',
  },
  {
    id: 'task-2',
    title: 'Breakfast Meal Bolus',
    timeSlot: 'breakfast',
    scheduledTime: '08:00',
    insulinBrand: 'Humalog (Lispro)',
    insulinType: 'rapid',
    defaultUnits: 6,
    isCompleted: true,
    completedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    actualUnits: 6,
    injectionSite: 'abdomen_lower_left',
    bloodGlucose: 114,
    carbsGrams: 55,
    notes: 'Oatmeal & blueberries (55g carbs)',
  },
  {
    id: 'task-3',
    title: 'Lunch Bolus',
    timeSlot: 'lunch',
    scheduledTime: '12:30',
    insulinBrand: 'Humalog (Lispro)',
    insulinType: 'rapid',
    defaultUnits: 7,
    isCompleted: false,
  },
  {
    id: 'task-4',
    title: 'Dinner Bolus',
    timeSlot: 'dinner',
    scheduledTime: '18:30',
    insulinBrand: 'Humalog (Lispro)',
    insulinType: 'rapid',
    defaultUnits: 8,
    isCompleted: false,
  },
  {
    id: 'task-5',
    title: 'Bedtime Glucose & Correction Check',
    timeSlot: 'bedtime',
    scheduledTime: '22:00',
    insulinBrand: 'Humalog (Lispro)',
    insulinType: 'rapid',
    defaultUnits: 0,
    isCompleted: false,
  },
];

export const DEFAULT_REMINDERS: DailyReminder[] = [
  { id: 'rem-1', label: 'Morning Basal & Breakfast', time: '07:30', mealSlot: 'breakfast', enabled: true, soundEnabled: true },
  { id: 'rem-2', label: 'Mid-Morning Check', time: '10:30', mealSlot: 'snack', enabled: true, soundEnabled: false },
  { id: 'rem-3', label: 'Lunch Bolus Check', time: '12:30', mealSlot: 'lunch', enabled: true, soundEnabled: true },
  { id: 'rem-4', label: 'Afternoon Check / Snack', time: '15:30', mealSlot: 'snack', enabled: false, soundEnabled: false },
  { id: 'rem-5', label: 'Dinner Bolus Check', time: '18:30', mealSlot: 'dinner', enabled: true, soundEnabled: true },
  { id: 'rem-6', label: 'Bedtime Check & Basal', time: '22:00', mealSlot: 'bedtime', enabled: true, soundEnabled: true },
];

/** Generate 14 days of realistic sample logs for rich historical and clinical reports */
export function generateSeedData(): { logs: InsulinLog[]; readings: GlucoseReading[] } {
  const logs: InsulinLog[] = [];
  const readings: GlucoseReading[] = [];
  const now = new Date();
  
  const siteSequence: InjectionSite[] = [
    'abdomen_upper_left',
    'abdomen_upper_right',
    'thigh_left',
    'thigh_right',
    'abdomen_lower_left',
    'abdomen_lower_right',
    'arm_left',
    'arm_right',
    'buttock_left',
    'buttock_right',
  ];

  // 14 days back
  for (let i = 14; i >= 1; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dayStr = dayDate.toISOString().split('T')[0];

    // Morning Fasting Check
    const morningBg = Math.floor(92 + (Math.sin(i * 1.5) * 22) + (i % 3 === 0 ? 15 : -8));
    readings.push({
      id: `bg-${dayStr}-morning`,
      timestamp: `${dayStr}T07:15:00.000Z`,
      value: morningBg,
      context: 'fasting',
      notes: morningBg < 70 ? 'Woke up feeling slightly shaky' : 'Fasting waking check',
    });

    // Morning Basal shot
    logs.push({
      id: `log-${dayStr}-basal`,
      timestamp: `${dayStr}T07:30:00.000Z`,
      taskTitle: 'Morning Basal Injection',
      insulinBrand: 'Lantus (Glargine)',
      insulinType: 'long',
      units: 22,
      injectionSite: siteSequence[(i * 2) % siteSequence.length],
      glucoseBefore: morningBg,
      mealSlot: 'breakfast',
      notes: 'Morning long-acting baseline',
    });

    // Breakfast Bolus
    const breakfastCarbs = 45 + (i % 4) * 5;
    const breakfastUnits = Math.round(breakfastCarbs / 10);
    logs.push({
      id: `log-${dayStr}-bfeed`,
      timestamp: `${dayStr}T08:00:00.000Z`,
      taskTitle: 'Breakfast Meal Bolus',
      insulinBrand: 'Humalog (Lispro)',
      insulinType: 'rapid',
      units: breakfastUnits,
      injectionSite: siteSequence[(i * 2 + 1) % siteSequence.length],
      glucoseBefore: morningBg + 6,
      carbsGrams: breakfastCarbs,
      mealSlot: 'breakfast',
      notes: `Breakfast: whole grain toast, eggs, fruit (${breakfastCarbs}g carbs)`,
    });

    // Post-Breakfast Reading
    readings.push({
      id: `bg-${dayStr}-post-bfast`,
      timestamp: `${dayStr}T10:15:00.000Z`,
      value: Math.floor(125 + (Math.cos(i) * 28)),
      context: 'after_breakfast',
      notes: '2-hour post breakfast check',
    });

    // Lunch Bolus & Reading
    const lunchPreBg = Math.floor(104 + (Math.sin(i * 2) * 24));
    readings.push({
      id: `bg-${dayStr}-pre-lunch`,
      timestamp: `${dayStr}T12:20:00.000Z`,
      value: lunchPreBg,
      context: 'before_lunch',
    });

    const lunchCarbs = 55 + (i % 3) * 10;
    const lunchUnits = Math.round(lunchCarbs / 9.5);
    logs.push({
      id: `log-${dayStr}-lunch`,
      timestamp: `${dayStr}T12:35:00.000Z`,
      taskTitle: 'Lunch Bolus',
      insulinBrand: 'Humalog (Lispro)',
      insulinType: 'rapid',
      units: lunchUnits,
      injectionSite: siteSequence[(i * 2 + 2) % siteSequence.length],
      glucoseBefore: lunchPreBg,
      carbsGrams: lunchCarbs,
      mealSlot: 'lunch',
      notes: `Turkey & avocado sandwich, salad (${lunchCarbs}g carbs)`,
    });

    // Dinner Bolus & Reading
    const dinnerPreBg = Math.floor(118 + (Math.cos(i * 1.7) * 32));
    readings.push({
      id: `bg-${dayStr}-pre-dinner`,
      timestamp: `${dayStr}T18:15:00.000Z`,
      value: dinnerPreBg,
      context: 'before_dinner',
    });

    const dinnerCarbs = 65 + (i % 5) * 8;
    const dinnerUnits = Math.round(dinnerCarbs / 9);
    logs.push({
      id: `log-${dayStr}-dinner`,
      timestamp: `${dayStr}T18:40:00.000Z`,
      taskTitle: 'Dinner Bolus',
      insulinBrand: 'Humalog (Lispro)',
      insulinType: 'rapid',
      units: dinnerUnits,
      injectionSite: siteSequence[(i * 2 + 3) % siteSequence.length],
      glucoseBefore: dinnerPreBg,
      carbsGrams: dinnerCarbs,
      mealSlot: 'dinner',
      notes: `Dinner with salmon, roasted potatoes, asparagus (${dinnerCarbs}g carbs)`,
    });

    // Bedtime Reading
    const bedtimeBg = Math.floor(110 + (Math.sin(i * 0.9) * 20));
    readings.push({
      id: `bg-${dayStr}-bedtime`,
      timestamp: `${dayStr}T22:15:00.000Z`,
      value: bedtimeBg,
      context: 'bedtime',
      notes: 'Pre-sleep sensor scan',
    });
  }

  // Include 1 occasional mild hypo 4 days ago for realistic clinical review
  const hypoDay = new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0];
  readings.push({
    id: `bg-${hypoDay}-hypo`,
    timestamp: `${hypoDay}T16:20:00.000Z`,
    value: 58,
    context: 'symptoms',
    notes: 'Mild hypoglycemia after 45-min gym workout. Treated with 15g glucose tablets.',
  });

  readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { logs, readings };
}

// Storage Manager
export const StorageManager = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getTasks(): InsulinTask[] {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_DATE);
      
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      let tasks: InsulinTask[] = stored ? JSON.parse(stored) : DEFAULT_TASKS;

      // If a new day, reset today's completion status
      if (lastDate !== todayStr) {
        tasks = tasks.map((t) => ({
          ...t,
          isCompleted: false,
          completedAt: undefined,
          actualUnits: undefined,
          injectionSite: undefined,
          bloodGlucose: undefined,
          notes: undefined,
        }));
        localStorage.setItem(STORAGE_KEYS.LAST_DATE, todayStr);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      }
      return tasks;
    } catch {
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks: InsulinTask[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getLogs(): InsulinLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        const seed = generateSeedData();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(seed.logs));
        localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(seed.readings));
        return seed.logs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveLogs(logs: InsulinLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  getReadings(): GlucoseReading[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READINGS);
      if (!data) {
        const seed = generateSeedData();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(seed.logs));
        localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(seed.readings));
        return seed.readings;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveReadings(readings: GlucoseReading[]): void {
    localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
  },

  getReminders(): DailyReminder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  },

  saveReminders(reminders: DailyReminder[]): void {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getProjectMetrics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECT_METRICS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const initial = {
      startTime: '2026-09-25T06:13:44-07:00',
      endTime: null as string | null,
      tokensTotal: 2300,
    };
    localStorage.setItem(STORAGE_KEYS.PROJECT_METRICS, JSON.stringify(initial));
    return initial;
  },

  saveProjectMetrics(metrics: Record<string, unknown>) {
    localStorage.setItem(STORAGE_KEYS.PROJECT_METRICS, JSON.stringify(metrics));
  },
};

/**
 * Calculates recommended next injection site to avoid lipohypertrophy.
 */
export function getRecommendedNextSite(recentLogs: InsulinLog[]): {
  recommendedSite: InjectionSite;
  siteName: string;
  reason: string;
  lastUsedSite?: InjectionSite;
} {
  const lastLog = recentLogs[0];
  const lastSite = lastLog?.injectionSite;

  const usedSitesCount = recentLogs.slice(0, 10).map((l) => l.injectionSite);
  
  // Find site least used recently
  const candidate = INJECTION_SITES.find((s) => !usedSitesCount.includes(s.id)) ||
    INJECTION_SITES.find((s) => s.id !== lastSite) ||
    INJECTION_SITES[0];

  const siteObj = INJECTION_SITES.find((s) => s.id === candidate.id) || INJECTION_SITES[0];

  return {
    recommendedSite: candidate.id,
    siteName: siteObj.name,
    reason: lastSite
      ? `Rotating away from ${INJECTION_SITES.find((s) => s.id === lastSite)?.name || 'previous site'} to prevent lipohypertrophy.`
      : 'Optimal initial site for balanced subcutaneous absorption.',
    lastUsedSite: lastSite,
  };
}

/**
 * Calculate clinical metrics from glucose readings:
 * - Average Blood Glucose (mg/dL)
 * - Estimated A1C (eA1C = (avgBG + 46.7) / 28.7)
 * - Time in Range % (TIR: 70 - 180 mg/dL)
 * - Very Low % (<54)
 * - Low % (54-69)
 * - High % (181-250)
 * - Very High % (>250)
 * - Standard Deviation & Coefficient of Variation (CV)
 */
export function calculateClinicalMetrics(readings: GlucoseReading[], targetLow = 70, targetHigh = 180) {
  if (!readings || readings.length === 0) {
    return {
      count: 0,
      avgBg: 0,
      estimatedA1c: 0,
      tirPercentage: 0,
      veryLowCount: 0,
      lowCount: 0,
      inRangeCount: 0,
      highCount: 0,
      veryHighCount: 0,
      veryLowPct: 0,
      lowPct: 0,
      inRangePct: 0,
      highPct: 0,
      veryHighPct: 0,
      standardDeviation: 0,
      cvPercentage: 0,
      lowestBg: 0,
      highestBg: 0,
    };
  }

  const values = readings.map((r) => r.value);
  const total = values.reduce((sum, v) => sum + v, 0);
  const avgBg = Math.round(total / values.length);

  // Standard Nathan et al. formula: eA1C = (avgBG + 46.7) / 28.7
  const estimatedA1c = Number(((avgBg + 46.7) / 28.7).toFixed(1));

  let veryLowCount = 0;
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;
  let veryHighCount = 0;

  values.forEach((val) => {
    if (val < 54) veryLowCount++;
    else if (val < targetLow) lowCount++;
    else if (val <= targetHigh) inRangeCount++;
    else if (val <= 250) highCount++;
    else veryHighCount++;
  });

  const count = values.length;
  const veryLowPct = Math.round((veryLowCount / count) * 100);
  const lowPct = Math.round((lowCount / count) * 100);
  const inRangePct = Math.round((inRangeCount / count) * 100);
  const highPct = Math.round((highCount / count) * 100);
  const veryHighPct = Math.round((veryHighCount / count) * 100);

  // Standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avgBg, 2), 0) / count;
  const standardDeviation = Math.round(Math.sqrt(variance));
  const cvPercentage = avgBg > 0 ? Math.round((standardDeviation / avgBg) * 100) : 0;

  return {
    count,
    avgBg,
    estimatedA1c,
    tirPercentage: inRangePct,
    veryLowCount,
    lowCount,
    inRangeCount,
    highCount,
    veryHighCount,
    veryLowPct,
    lowPct,
    inRangePct,
    highPct,
    veryHighPct,
    standardDeviation,
    cvPercentage,
    lowestBg: Math.min(...values),
    highestBg: Math.max(...values),
  };
}

/**
 * Generates CSV string for historical logs and readings.
 */
export function exportToCSV(logs: InsulinLog[], readings: GlucoseReading[]): string {
  const rows: string[] = [];
  rows.push(['Record Type', 'Date & Time', 'Glucose (mg/dL)', 'Insulin Brand', 'Insulin Type', 'Units', 'Injection Site', 'Carbs (g)', 'Context/Notes'].join(','));

  logs.forEach((log) => {
    const site = INJECTION_SITES.find((s) => s.id === log.injectionSite)?.name || log.injectionSite;
    rows.push([
      'Insulin Dose',
      `"${new Date(log.timestamp).toLocaleString()}"`,
      log.glucoseBefore ?? '',
      `"${log.insulinBrand}"`,
      `"${log.insulinType}"`,
      log.units,
      `"${site}"`,
      log.carbsGrams ?? '',
      `"${(log.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
  });

  readings.forEach((r) => {
    rows.push([
      'Blood Glucose',
      `"${new Date(r.timestamp).toLocaleString()}"`,
      r.value,
      '',
      '',
      '',
      '',
      '',
      `"${r.context} - ${(r.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
  });

  return rows.join('\n');
}
