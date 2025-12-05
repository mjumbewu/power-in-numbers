# System Design Document: "Designing Your Fees" Application

## 1. Project Overview

We are building a reactive web application for freelance (or self-employed)  project budgeting that centers transparency, equity, care, and repair (including the design of"producerial shares)." The app allows individual collaborators to calculate their true "Goal Wage" based on real-life expenses, and then allows a Project Team to build budget scenarios that balance these individual needs and desires against available funding contingencies.

**Core Philosophy:**

* **Micro Level:** Help self-employed people calculate a "Goal Rate" that covers their actual cost of living, not just market standard, as well as a “Now Rate” that considers a more aligned relationship to their labor time. Mobilize these rates in relationship to their contract engagements with others.
* **Macro Level:** Allow projects to consider a fuller financial narrative of the workers building the project, letting the choicemaking involved in budgeting be a more intentional process that also calculates "Producerial Shares" (equity) when a project chooses not to pay an artist's full Goal Rate.

**Reference documents:**

* Alpha version of tool in Google Sheet form: https://docs.google.com/spreadsheets/d/1HDBkE9-un2oXT4eIVg5cffbVc1Zuu7_6AUV6TTZoGpc/edit?usp=sharing
* Notes on the project overall: https://docs.google.com/document/d/1LcW-_6KJIZqYZdovkp-gklTsZ65DqHRQiKnyRHTOi6A/edit?usp=sharing

## 2. Technical Stack Specifications

* **Framework:** Vue.js 3 (Composition API `<script setup>`)
* **State Management:** Pinia (Required for complex reactive math between components)
* **Styling:** Tailwind CSS (Focus on clean, tabular data presentation)
* **Icons:** Lucide-Vue-Next

## 3. Data Model (State Store)

The application state should be central. Please use a Pinia store named `useBudgetStore`.

```typescript
// Types based on the project's Entity Relationship Diagram

type RateType = 'GOAL' | 'NOW' | 'MINIMUM';

interface Collaborator {
  id: string;
  name: string;
  colorTheme: string; // e.g., 'bg-red-100', for UI distinction

  // Financial Profile Inputs (from "Designing Your Fees" worksheet)
  livingExpenses: number; // Monthly total
  billableHoursPerYear: number;
  taxRate: number; // e.g., 0.30
  desiredSavings: number;

  // Calculated Outputs
  goalHourlyRate: number; // Calculated: (Expenses + Savings) / (1 - TaxRate) / BillableHours
  nowHourlyRate: number; // User input based on current reality
}

interface ProjectPhase {
  id: string;
  name: string; // e.g., "Creation", "Touring"
  weeks: number;
  hoursPerWeek: number;
}

interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  status: 'CONFIRMED' | 'LIKELY' | 'UNCONFIRMED';
}

interface Scenario {
  id: string;
  name: string; // e.g., "Dream Budget", "Bare Bones"

  // The "Levers" the user pulls
  wageFloor: number; // e.g., $25.00/hr
  targetpayPercentage: number; // e.g., 0.70 (70% of Goal Rate)

  // Derived Data
  totalCost: number;
  deficitSurplus: number;
}
```

## 4\. Component Hierarchy & Views

### View 1: The Collaborator Input ("Micro")

  * **Component:** `CollaboratorWizard.vue`
  * **Purpose:** Replicates the logic from the "Red" sheet in the Google Sheet at https://docs.google.com/spreadsheets/d/1HDBkE9-un2oXT4eIVg5cffbVc1Zuu7_6AUV6TTZoGpc/edit?usp=sharing.
  * **Inputs:**
      * Annual Expenses List (Rent, Food, etc.)
      * Work Habits (Hours/day, Days/week, Weeks/year)
      * Non-billable time % (Admin, Research)
  * **Reactive Output:**
      * Display a live comparison card: **"My Goal Rate: $X/hr"** vs **"My Current Rate: $Y/hr"**.

### View 2: The Project Dashboard ("Macro")

  * **Component:** `ProjectBuilder.vue`
  * **Layout:**
      * **Top Bar:** Global Project Metrics (Total Income, Total Cost, Producerial Shares Generated).
      * **Left Panel:** Income Sources (Add/Edit Grants, Commissions).
      * **Main Stage:** The **Scenario Matrix** (The core feature).

### View 3: The Scenario Matrix (Complex Data Table)

  * **Component:** `ScenarioTable.vue`
  * **Behavior:** This is the implementation of the "MASTER SAMPLE PROJECT BUDGET" sheet in the Google Sheet at https://docs.google.com/spreadsheets/d/1HDBkE9-un2oXT4eIVg5cffbVc1Zuu7_6AUV6TTZoGpc/edit?usp=sharing.
  * **Rows:** Collaborators.
  * **Columns:**
    1.  Name
    2.  Goal Rate (ReadOnly, from Store)
    3.  Total Hours (Calculated from Phase inputs)
    4.  **Actual Hourly Pay** (Computed Formula)
    5.  Total Pay (Hours \* Actual Pay)
    6.  **Producerial Shares Earned** (Computed Formula)
  * **Controls (The "Levers"):**
      * Sliders or Inputs for `Wage Floor ($)` and `Percentage of Goal (%)`.
      * Changing these immediately updates the "Actual Hourly Pay" and "Producerial Shares" columns for all rows.

## 5\. Critical Business Logic (Formulas)

You must implement these exact formulas in the computed properties:

**1. Actual Hourly Pay Calculation:**
For a given Scenario and Collaborator:

```javascript
// Logic from "Shareout Notes" page 3
const rawRate = collaborator.goalHourlyRate * scenario.targetpayPercentage;
const actualRate = Math.max(rawRate, scenario.wageFloor);

// Important: If the collaborator's goal rate is LOWER than the floor,
// they just get the floor (or their goal, depending on policy - assume Floor for now).
return actualRate;
```

**2. Producerial Share Calculation (The "Equity" Logic):**
If the project pays less than the Goal Rate, the difference is "Invested" by the artist.

```javascript
const hourlyGap = collaborator.goalHourlyRate - actualHourlyPay;
const totalInvestment = hourlyGap * totalProjectHours;

if (totalInvestment > 0) {
   return totalInvestment; // This is the value of their "Shares"
} else {
   return 0; // They are being paid their full rate or more
}
```

**3. Budget Deficit/Surplus:**

```javascript
const totalIncome = incomeSources
    .filter(i => i.status === 'CONFIRMED') // Toggle to include LIKELY if user wants
    .reduce((sum, i) => sum + i.amount, 0);

const totalLaborCost = collaborators.reduce((sum, c) => sum + c.totalPay, 0);
const totalExpenses = otherExpenses.reduce((sum, e) => sum + e.cost, 0);

const result = totalIncome - (totalLaborCost + totalExpenses);
// UI should turn RED if result < 0
```

## 6\. UI/UX Guidelines

1.  **Visual Weight:** Use the "Color Themes" from the Google Sheet (Red, Blue, Orange, Purple, Pink) to visually tag rows belonging to specific collaborators.
2.  **Toggle "Dreaming" Mode:** Include a switch to include "Unconfirmed/Likely" income sources in the calculation. This changes the Deficit number, allowing users to see "What if we get that grant?" scenarios.
3.  **Responsiveness:** The tables will be wide. Use horizontal scrolling with sticky first columns (Collaborator Name) for mobile.

## 7\. Deliverables

Please generate the following files:

1.  `stores/budget.js` (Pinia store with logic)
2.  `components/ScenarioMatrix.vue` (The main logic table)
3.  `App.vue` (The layout assembling the views)
