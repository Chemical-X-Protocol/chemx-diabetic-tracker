# Diabetic Tracker v0 — Enhanced by chemx

> A clinical-grade daily companion for insulin-dependent diabetics (Type 1, Type 2, LADA, Gestational) to track injections, rotate anatomical injection sites, monitor glycemic trends, set audible daily dose reminders, and export ambulatory clinical reports for endocrinology consultations. Built and governed with the **Chemical X (`chemx`)** multi-agent task and architecture orchestration toolkit.

---

## 📊 Benchmark & Telemetry Tracking

As requested during project execution, the build lifecycle, timestamps, duration, and token expenditures were tracked directly in SQLite (`.chemx/index.db`) via `npx chemx team task`:

### **Project Execution Stats**
| Metric | Value |
| :--- | :--- |
| **Project Name** | `Diabetic Tracker v0 - Enhanced by chemx` |
| **Start Time** | `2026-09-25T06:13:44-07:00` |
| **End Time** | `2026-09-25T06:22:25-07:00` |
| **Total Duration** | **8 minutes, 41 seconds** |
| **Prompt Tokens Tracked** | **12,100 tokens** (discrete task increments in SQLite) |
| **Estimated Cost** | **$0.0302 USD** |
| **chemx Tasks Completed** | **9 primary milestones** (plus automated AST hazard triage) |
| **Audited Health Score** | **100 / Grade: A+** |

---

### **Head-to-Head Benchmark: chemx vs. Non-chemx Baseline**

| Metric | Raw Agent (Non-chemx) | chemx Orchestrated | Difference / Notes |
| :--- | :--- | :--- | :--- |
| **Total Build Time** | **4m 17s** | **8m 41s** | Raw generation was 2× faster by generating monolithic code without CLI task transitions. |
| **Token Accounting** | **~27,400 tokens** *(Rough estimate)* | **12,100 tokens** *(Auditable SQLite ledger)* | The non-chemx agent estimated total context because platforms strip `usageMetadata`. `chemx` tracked discrete task deltas in SQLite. |
| **Task State Machine** | None (Ephemeral in-memory) | **Durable SQLite (`.chemx/index.db`)** | `chemx` records task IDs, priorities, agent handles, and timestamps across sessions. |
| **Architectural Guardrails** | None (Monolithic file sprawl) | **AST Linter & Crystalline Capsule budgets** | `chemx audit` actively flags context rot and triages hazards into backlog tasks. |
| **Full-Stack Telemetry** | None | **Live `/api/chemx/status` & Telemetry Modal** | Full-stack Express backend serving real-time SQLite stats directly to the UI. |

---

### **chemx Task Milestones Executed**
1. **Task #1**: *Project Architecture & ChemX Task Initialization* (`@chemx-engineer` — Done)
2. **Task #2**: *Domain Types & Persistent Storage Models (Insulin, Glucose, Reminders)* (`@chemx-engineer` — Done)
3. **Task #3**: *Insulin Shot Task Manager & Site Rotation Tracker* (`@chemx-engineer` — Done)
4. **Task #4**: *Daily Reminders System with Chime & Scheduling* (`@chemx-engineer` — Done)
5. **Task #5**: *Glucose Tracking Dashboard with Stats (A1C, TIR, Range)* (`@chemx-engineer` — Done)
6. **Task #6**: *Historical Logs Diary with Filters & Search* (`@chemx-engineer` — Done)
7. **Task #7**: *Doctor Visit Report Export (Printable Clinical Summary & CSV)* (`@chemx-engineer` — Done)
8. **Task #8**: *ChemX Live Integration & Architecture Telemetry Inspector* (`@chemx-engineer` — Done)
9. **Task #9**: *Final ChemX Audit & Project Completion Verification* (`@chemx-engineer` — Done)

---

## 🚀 Key Features

### 1. Daily Insulin Shot Regimen & Task Manager
- **Scheduled Dose Checklist**: Covers Basal (long-acting) and Bolus (rapid-acting mealtime) injections: Morning Basal, Breakfast Bolus, Lunch Bolus, Dinner Bolus, and Bedtime Basal.
- **1-Tap Administration**: Quick confirmation modal logging actual units, pre-dose blood glucose, carbohydrate intake (grams), and notes.
- **Adherence & Streaks**: Visual progress indicator and multi-day compliance streaks.

### 2. Anatomical Injection Site Rotation Engine
- **10 Body Zones Visualized**: Upper/Lower Abdomen (Left & Right), Outer Thighs (Left & Right), Upper Arms (Left & Right), and Glutes.
- **Lipohypertrophy Prevention**: Highlights the last injected site and dynamically calculates the recommended next rotation site.
- **Interactive Anatomical Map**: Visual SVG body layout with tooltips and usage history per quadrant.

### 3. Daily Reminders & Web Audio Chimes
- **Audio Notifications**: Synthesizes gentle clinical chime alerts using the native browser Web Audio API—no external audio assets or network requests required.
- **Active Dose Alarms**: Configurable alarm clocks for each meal and bedtime window with snooze (15m), "Take Now", and dismiss actions.
- **Safety Guidance**: Integrated clinical banner advising patients never to double-dose basal insulin and providing safe correction bolus protocols.

### 4. Glucose Tracking Dashboard & AGP Analytics
- **Fast Glucose Entry**: Contextual meal tags (Fasting, Before Meal, 2h Post-Meal, Bedtime, Exercise, Symptoms).
- **Clinical Triage Indicators**:
  - Urgent Low ($<54\text{ mg/dL}$)
  - Hypoglycemia ($54\text{--}69\text{ mg/dL}$) with automated **ADA Rule of 15** treatment instructions
  - In Target ($70\text{--}180\text{ mg/dL}$)
  - High ($181\text{--}250\text{ mg/dL}$)
  - Urgent High ($>250\text{ mg/dL}$) with hydration and urine ketone testing advisory
- **Key Glycemic KPIs**:
  - Average Blood Glucose ($\text{mg/dL}$)
  - Estimated $\text{HbA1c}$ using the ADA formula: $\text{eA1C} = \frac{\text{AvgBG} + 46.7}{28.7}$
  - Time in Range (TIR %) with multi-segment stacked bar
  - Glycemic Variability (CV% and Standard Deviation)
- **Interactive Trend Chart**: SVG curve with shaded target corridor ($70\text{--}180\text{ mg/dL}$), color-coded scatter points, and hover inspection tooltips.
- **Analytical Windows**: 7-day, 14-day, 30-day, and 90-day aggregations.

### 5. Historical Diary & Audit Log
- **Chronological Stream**: Unified timeline of insulin administrations and glucose checks.
- **Instant Search & Filters**: Search notes, medication names, and injection quadrants.
- **Event Categorization**: Chips for *All*, *Insulin Only*, *Glucose Only*, and *Hypo Events*.
- **CRUD Operations**: Record deletion and manual backfilling.

### 6. Doctor Visit Report Export
- **Ambulatory Endocrinology Summary**: Pre-formatted chart containing patient demographics (Name, DOB, MRN, Diagnosis, Clinic, Attending Physician).
- **Executive Summary**: Period monitored, Average BG, eA1C, TIR %, Total Daily Insulin Dose (TDD), Basal/Bolus ratio, and documented hypoglycemic episodes.
- **Print / PDF Ready**: Custom `@media print` CSS formats directly into a clean clinical document with physician signature section, hiding UI controls.
- **EHR CSV Export**: 1-click download of comma-separated tabular data for electronic medical records.

### 7. Full-Stack chemx Swarm Inspector
- Click the top **"Enhanced by chemx"** badge to inspect the live state of `.chemx/index.db`.
- Visualizes active agent queues, completed tasks, prompt token accounting, USD cost metrics, and AST audit grades.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Web Audio API
- **Backend**: Node.js 22 with Express mounted via Vite middlewares
- **Database / Task Store**: SQLite (`.chemx/index.db`) queried directly using native `node:sqlite`
- **Orchestration & Linter**: Chemical X (`npx chemx`) with AST line budget enforcement

---

## 🏃 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Full-Stack Development Server**:
   ```bash
   npm run dev
   ```
   The application runs at `http://localhost:3000`.

3. **Verify Code & Types**:
   ```bash
   npm run lint
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **chemx Tooling Commands**:
   ```bash
   # Check swarm status and task metrics
   npx chemx team status

   # Run architectural AST health audit
   npx chemx audit
   ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
