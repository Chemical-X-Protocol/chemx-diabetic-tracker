export type InjectionSite =
  | 'abdomen_upper_left'
  | 'abdomen_upper_right'
  | 'abdomen_lower_left'
  | 'abdomen_lower_right'
  | 'thigh_left'
  | 'thigh_right'
  | 'arm_left'
  | 'arm_right'
  | 'buttock_left'
  | 'buttock_right';

export interface SiteInfo {
  id: InjectionSite;
  name: string;
  category: 'Abdomen' | 'Thighs' | 'Arms' | 'Glutes';
  description: string;
}

export const INJECTION_SITES: SiteInfo[] = [
  { id: 'abdomen_upper_left', name: 'Upper Left Abdomen', category: 'Abdomen', description: '2 inches left and above navel' },
  { id: 'abdomen_upper_right', name: 'Upper Right Abdomen', category: 'Abdomen', description: '2 inches right and above navel' },
  { id: 'abdomen_lower_left', name: 'Lower Left Abdomen', category: 'Abdomen', description: '2 inches left and below navel' },
  { id: 'abdomen_lower_right', name: 'Lower Right Abdomen', category: 'Abdomen', description: '2 inches right and below navel' },
  { id: 'thigh_left', name: 'Left Outer Thigh', category: 'Thighs', description: 'Outer upper quadrant of left thigh' },
  { id: 'thigh_right', name: 'Right Outer Thigh', category: 'Thighs', description: 'Outer upper quadrant of right thigh' },
  { id: 'arm_left', name: 'Left Upper Arm', category: 'Arms', description: 'Posterior surface of left upper arm' },
  { id: 'arm_right', name: 'Right Upper Arm', category: 'Arms', description: 'Posterior surface of right upper arm' },
  { id: 'buttock_left', name: 'Left Upper Buttock', category: 'Glutes', description: 'Upper outer quadrant of left buttock' },
  { id: 'buttock_right', name: 'Right Upper Buttock', category: 'Glutes', description: 'Upper outer quadrant of right buttock' },
];

export type InsulinType =
  | 'rapid'
  | 'short'
  | 'intermediate'
  | 'long'
  | 'ultra_rapid'
  | 'pre_mixed';

export type MealSlot =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'bedtime'
  | 'snack'
  | 'correction';

export type GlucoseContext =
  | 'fasting'
  | 'before_breakfast'
  | 'after_breakfast'
  | 'before_lunch'
  | 'after_lunch'
  | 'before_dinner'
  | 'after_dinner'
  | 'bedtime'
  | 'night'
  | 'post_exercise'
  | 'symptoms';

export interface InsulinTask {
  id: string;
  title: string;
  timeSlot: MealSlot;
  scheduledTime: string; // "07:30"
  insulinBrand: string;
  insulinType: InsulinType;
  defaultUnits: number;
  isCompleted: boolean;
  completedAt?: string;
  actualUnits?: number;
  injectionSite?: InjectionSite;
  bloodGlucose?: number;
  carbsGrams?: number;
  notes?: string;
}

export interface InsulinLog {
  id: string;
  timestamp: string; // ISO string
  taskId?: string;
  taskTitle: string;
  insulinBrand: string;
  insulinType: InsulinType;
  units: number;
  injectionSite: InjectionSite;
  glucoseBefore?: number;
  carbsGrams?: number;
  mealSlot: MealSlot;
  notes: string;
}

export interface GlucoseReading {
  id: string;
  timestamp: string;
  value: number; // mg/dL
  context: GlucoseContext;
  notes?: string;
}

export interface DailyReminder {
  id: string;
  label: string;
  time: string; // "HH:MM"
  mealSlot: MealSlot;
  enabled: boolean;
  soundEnabled: boolean;
  snoozedUntil?: string;
}

export interface UserProfile {
  patientName: string;
  dob: string;
  mrn: string;
  diabetesType: 'Type 1' | 'Type 2' | 'LADA' | 'Gestational';
  physicianName: string;
  clinicName: string;
  physicianPhone: string;
  physicianEmail: string;
  targetRangeLow: number; // e.g. 70 mg/dL
  targetRangeHigh: number; // e.g. 180 mg/dL
  fastingTargetLow: number; // 70
  fastingTargetHigh: number; // 130
  urgentLow: number; // 54
  urgentHigh: number; // 250
  glucoseUnit: 'mg/dL' | 'mmol/L';
  preferredBasalBrand: string;
  preferredBolusBrand: string;
  carbRatio: number; // 1 unit per X grams
  correctionFactor: number; // 1 unit drops BG by X mg/dL
}

export interface ChemxTaskRecord {
  id: number;
  title: string;
  description: string;
  tier: string;
  status: 'queued' | 'in_progress' | 'done' | 'blocked';
  priority: number;
  assigned_agent_id: string | null;
  prompt_tokens: number;
  total_tokens: number;
  cost_usd: number;
  created_at: number;
  updated_at: number;
}

export interface ChemxSwarmStatus {
  agentsTotal: number;
  tasksTotal: number;
  tasksQueued: number;
  tasksDone: number;
  tasksInFlight: number;
  promptTokens: number;
  costUsd: number;
  auditGrade?: string;
  healthScore?: number;
  linesOfCode?: number;
  filesCount?: number;
}
