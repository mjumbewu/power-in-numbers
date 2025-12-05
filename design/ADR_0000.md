# Narrative Architecture: The "Power in Numbers" & Project Budget Workflow

This document describes the logical flow, data relationships, and specific mathematical formulas found in the "Alpha Version" Google Sheets file. It is divided into two distinct but connected modules: **1. The Micro Module (Individual Financial Planning)** and **2. The Macro Module (Collaborative Project Budgeting).**

## Module 1: The Micro View ("Power in Numbers")
*Reference Source: the `Red` spreadsheet (and Blue/Orange/Purple variants)*

**Purpose:** To calculate a collaborator's "Goal Hourly Rate" based on their actual life expenses, taxes, and desired work-life balance, rather than market standards.

### 1. The Inputs (User Variables)
The user provides three categories of data:

1.  **Work Schedule Aspirations:**
    * `Target Hours per Day` (e.g., 7)
    * `Target Days per Week` (e.g., 5)
    * `Target Weeks per Year` (e.g., 43) — *Note: This implies vacation/rest time.*
    * `Non-Billable Work Percentage` (e.g., 20%) — *Time spent on admin, research, or unpaid labor.*

2.  **Annualized Expenses:**
    * The user lists monthly or annual costs for categories such as: Rent/Mortgage, Utilities, Food, Childcare, Student Loans, Savings, Retirement, etc.
    * *Logic:* All entries are converted to an **Annual Total**.

3.  **Current Reality Check (The "Now" Number):**
    * `Actual Current Annual Net Income` — What the user actually made last year (after taxes).

### 2. The Logic & Formulas

**Step A: Calculate Total Financial Need**
The system sums all annualized expenses to get the `Net Need`. It then applies a Tax Multiplier to ensure the rate covers tax liability.
> `Total Goal Gross Income` = `Sum(Annual Expenses)` + (`Sum(Annual Expenses)` * `Tax Rate Buffer` [set to 20% in spreadsheet])

**Step B: Calculate Billable Capacity**
The system calculates how many hours the user can actually sell, accounting for admin time.
> `Total Work Hours` = `Weeks` * `Days` * `Hours`
> `Billable Hours` = `Total Work Hours` * (1 - `Non-Billable Percentage`)

**Step C: The Rate Outputs**
The system generates two distinct rates:
1.  **The Goal Rate:** The rate required to meet the `Total Goal Gross Income`.
    > `Goal Hourly Rate` = `Total Goal Gross Income` / `Billable Hours`
2.  **The Now Rate:** The rate reflected by their current actual income.
    > `Now Hourly Rate` = `Actual Current Annual Net Income` / `Billable Hours`

---

## Module 2: The Macro View ("Project Budget & Equity Scenarios")
*Reference Source: `MASTER SAMPLE PROJECT BUDGET` spreadsheet*

**Purpose:** To create a project budget that balances "Dream" wages (Goal Rates) against "Real" funding. It introduces the concept of **Producerial Shares** (Equity) for workers who are underpaid relative to their Goal Rate.

### 1. The Project "Pot" (Income)
* **Income Line Items:** List of grants, commissions, and donations.
* **Status Toggle:** Each item is marked `Confirmed` or `Unconfirmed`.
* **Logic:** The `Total Available Budget` is the sum of all *active* income sources (users can choose to toggle "Unconfirmed" items on to see "Dream" scenarios).

### 2. The "Scenario Engine" (The Core Feature)
The Project Lead does not manually type in wages. Instead, they adjust two global "Levers" that apply to all collaborators:

1.  **Lever A: Wage Floor ($)** — No one gets paid less than this hourly amount (e.g., $25/hr).
2.  **Lever B: Pay Rate Percentage (%)** — The project can afford to pay X% of everyone's Goal Rate (e.g., 70%).

### 3. The Collaborator Grid (Rows)
Each row represents a person (imported from Module 1). The columns are calculated as follows:

* **Column 1: Goal Rate** (ReadOnly, imported from Module 1).
* **Column 2: Phase Hours** (Input). How many hours is this person working on this specific project phase?
* **Column 3: Actual Hourly Pay (The Logic Check).**
    * This is the critical formula. The system calculates a `Proposed Rate` (`Goal Rate` * `Pay Rate Percentage`).
    * It compares `Proposed Rate` vs `Wage Floor`.
    * **Formula:** `Actual Pay` = `MAX( (Goal Rate * Percentage), Wage Floor )`
    * *Note:* If the `Goal Rate` is lower than the `Wage Floor`, they are paid the `Wage Floor`.
* **Column 4: Total Cash Pay.**
    * **Formula:** `Actual Pay` * `Phase Hours`.

### 4. The Equity Calculation (Producerial Shares)
If the project cannot pay the full Goal Rate, the unpaid labor is converted into Equity (Shares).

* **The Gap:** `Hourly Deficit` = `Goal Rate` - `Actual Pay`.
* **The Share:** `Total Producerial Shares` = `Hourly Deficit` * `Phase Hours`.
* *Constraint:* If `Actual Pay` > `Goal Rate`, Producerial Shares = 0 (No negative equity).

### 5. Project-Level Results
* **Total Labor Cost:** Sum of all Collaborators' `Total Cash Pay`.
* **Total Expenses:** Sum of non-labor items (Travel, Accessibility, Materials).
* **The Bottom Line:**
    > `Profit/Deficit` = `Total Available Budget` - (`Total Labor Cost` + `Total Expenses`)

---

## Narrative Use Case for the Interface

**User Flow:**
1.  **Setup:** "Red", "Blue", and "Orange" (collaborators) fill out their **Micro** forms. Red needs $96/hr to survive. Blue needs $112/hr. Orange needs $401/hr (high expenses).
2.  **Project Assembly:** The Project Lead adds these three people to a "Creation Phase" (40 hours each).
3.  **The Crisis:** The `Total Available Budget` is only $5,000.
4.  **The Adjustment (The Interface Interaction):**
    * If the Lead pays 100% of Goal Rates, the Deficit is huge (Red line).
    * The Lead drags the **Percentage Lever** down to **50%**.
    * *Result:*
        * Red gets $48/hr.
        * Blue gets $56/hr.
        * Orange gets $200/hr.
    * The Lead notices Red's rate is too low. They set the **Wage Floor Lever** to **$60/hr**.
    * *New Result:*
        * Red gets $60/hr (bumped by Floor).
        * Blue gets $60/hr (bumped by Floor).
        * Orange gets $200/hr (50% of their high rate).
5.  **Equity Tracking:** The interface automatically calculates that Red is "investing" $36/hr ($96 goal - $60 actual) into the project. This accumulates as "Producerial Shares" displayed next to their name.