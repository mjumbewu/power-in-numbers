/**
 * Calculation utilities for Power in Numbers budgeting system
 */

/**
 * Calculate annual costs from monthly expenses
 */
export function calculateAnnualCosts(expenses) {
    return expenses.reduce((total, expense) => {
        const monthlyAmount = expense.amount || 0;
        const annualAmount = monthlyAmount * 12;
        return total + annualAmount;
    }, 0);
}

/**
 * Calculate personal rates based on financial profile
 * Returns: { goalHourly, goalDaily, nowHourly, nowDaily, minimumHourly, minimumDaily }
 */
export function calculatePersonalRates(profile) {
    // 1. Work Schedule Inputs (defaults from reference if missing)
    const targetHoursPerDay = profile.targetHoursPerDay || 7;
    const targetDaysPerWeek = profile.targetDaysPerWeek || 5;
    const targetWeeksPerYear = profile.targetWeeksPerYear || 43;
    const nonBillablePercentage = (profile.nonBillablePercentage || 20) / 100;

    // 2. Calculate Billable Capacity
    const totalWorkHours = targetWeeksPerYear * targetDaysPerWeek * targetHoursPerDay;
    const billableHours = totalWorkHours * (1 - nonBillablePercentage);

    // 3. Annualized Expenses & Needs
    const annualExpenses = calculateAnnualCosts(profile.expenses || []);
    const taxRateBuffer = 0.20; // 20% from reference

    // Step A: Calculate Total Financial Need (Goal Gross Income)
    // Reference: Sum(Annual Expenses) + (Sum(Annual Expenses) * Tax Rate Buffer)
    const goalAnnual = annualExpenses + (annualExpenses * taxRateBuffer);

    // Step C: The Rate Outputs

    // 1. The Goal Rate
    // Reference: Total Goal Gross Income / Billable Hours
    const goalHourly = billableHours > 0 ? goalAnnual / billableHours : 0;
    const goalDaily = goalHourly * targetHoursPerDay; // Derived for UI convenience

    // 2. The Now Rate
    // Reference: Actual Current Annual Net Income / Billable Hours
    const actualCurrentAnnualNetIncome = profile.actualCurrentAnnualNetIncome || 0;
    const nowHourly = billableHours > 0 ? actualCurrentAnnualNetIncome / billableHours : 0;
    const nowDaily = nowHourly * targetHoursPerDay;

    // 3. Minimum Rate (Keep existing logic as fallback/reference, though not in Module 1 spec)
    const minimumHourly = profile.minimumAcceptableRate || 25;
    const minimumDaily = minimumHourly * targetHoursPerDay;

    return {
        goalHourly: Math.round(goalHourly * 100) / 100,
        goalDaily: Math.round(goalDaily * 100) / 100,
        nowHourly: Math.round(nowHourly * 100) / 100,
        nowDaily: Math.round(nowDaily * 100) / 100,
        minimumHourly: Math.round(minimumHourly * 100) / 100,
        minimumDaily: Math.round(minimumDaily * 100) / 100,
        annualExpenses,
        actualCurrentAnnualNetIncome,
        goalAnnual: Math.round(goalAnnual),
        billableHours: Math.round(billableHours)
    };
}

/**
 * Calculate labor cost for a line item based on scenario rules
 * Returns: { calculatedRate, actualPay, producerialShares }
 */
export function calculateLaborCost(params) {
    const {
        personalGoalRate,
        hoursPerWeek,
        durationWeeks,
        scenarioRules
    } = params;

    const { wageFloor, percentageOfGoal } = scenarioRules;

    // Apply percentage to goal rate
    let calculatedRate = personalGoalRate * (percentageOfGoal / 100);

    // Apply wage floor
    const actualRate = Math.max(calculatedRate, wageFloor);

    // Calculate total hours and cost
    const totalHours = hoursPerWeek * durationWeeks;
    const actualPay = actualRate * totalHours;

    // Calculate producerial shares (difference between goal and actual)
    const goalPay = personalGoalRate * totalHours;
    const producerialShares = Math.max(0, goalPay - actualPay);

    return {
        calculatedRate: Math.round(actualRate * 100) / 100,
        actualPay: Math.round(actualPay * 100) / 100,
        producerialShares: Math.round(producerialShares * 100) / 100,
        totalHours,
        effectiveRate: actualRate
    };
}

/**
 * Calculate total budget for a scenario
 */
export function calculateScenarioBudget(lineItems) {
    const laborCosts = lineItems
        .filter(item => item.type === 'labor')
        .reduce((sum, item) => sum + (item.cost || 0), 0);

    const expenseCosts = lineItems
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + (item.cost || 0), 0);

    const total = laborCosts + expenseCosts;

    return {
        laborCosts: Math.round(laborCosts * 100) / 100,
        expenseCosts: Math.round(expenseCosts * 100) / 100,
        total: Math.round(total * 100) / 100
    };
}

/**
 * Calculate project funding status
 */
export function calculateFundingStatus(incomeSources, totalCosts) {
    const confirmedIncome = incomeSources
        .filter(source => source.status === 'confirmed')
        .reduce((sum, source) => sum + (source.amount || 0), 0);

    const likelyIncome = incomeSources
        .filter(source => source.status === 'likely')
        .reduce((sum, source) => sum + (source.amount || 0), 0);

    const totalIncome = confirmedIncome + likelyIncome;
    const deficit = totalCosts - confirmedIncome;

    return {
        confirmedIncome: Math.round(confirmedIncome * 100) / 100,
        likelyIncome: Math.round(likelyIncome * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        deficit: Math.round(deficit * 100) / 100,
        fundingPercentage: totalCosts > 0 ? Math.round((confirmedIncome / totalCosts) * 100) : 0
    };
}

/**
 * Calculate total equity/shares for a collaborator across projects
 */
export function calculateCollaboratorEquity(equityLogs) {
    return equityLogs.reduce((total, log) => {
        return total + (log.sharesEarned || 0);
    }, 0);
}

/**
 * Format currency
 */
export function formatCurrency(amount, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

/**
 * Generate unique ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
