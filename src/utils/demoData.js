/**
 * Demo data for Power in Numbers prototype
 */

import { generateId } from './calculations.js';

export const demoCollaborators = [
    {
        id: 'collab-1',
        name: 'Kristal Smith',
        email: 'kristal@example.com',
        role: 'Choreographer',
        createdAt: new Date('2024-01-15').toISOString()
    },
    {
        id: 'collab-2',
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        role: 'Sound Designer',
        createdAt: new Date('2024-02-01').toISOString()
    },
    {
        id: 'collab-3',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'Lighting Designer',
        createdAt: new Date('2024-02-10').toISOString()
    }
];

export const demoFinancialProfiles = [
    {
        id: 'profile-1',
        collaboratorId: 'collab-1',
        year: 2024,
        expenses: [
            { id: generateId(), category: 'Rent/Mortgage', amount: 2400 },
            { id: generateId(), category: 'Utilities', amount: 200 },
            { id: generateId(), category: 'Healthcare', amount: 450 },
            { id: generateId(), category: 'Groceries', amount: 500 },
            { id: generateId(), category: 'Transportation', amount: 300 },
            { id: generateId(), category: 'Student Loans', amount: 400 },
            { id: generateId(), category: 'Childcare', amount: 1200 }
        ],
        // New fields based on reference
        targetHoursPerDay: 7,
        targetDaysPerWeek: 5,
        targetWeeksPerYear: 43,
        nonBillablePercentage: 20,
        actualCurrentAnnualNetIncome: 45000,
        minimumAcceptableRate: 100,
        createdAt: new Date('2024-01-15').toISOString()
    },
    {
        id: 'profile-2',
        collaboratorId: 'collab-2',
        year: 2024,
        expenses: [
            { id: generateId(), category: 'Rent/Mortgage', amount: 1800 },
            { id: generateId(), category: 'Utilities', amount: 150 },
            { id: generateId(), category: 'Healthcare', amount: 350 },
            { id: generateId(), category: 'Groceries', amount: 400 },
            { id: generateId(), category: 'Transportation', amount: 200 }
        ],
        targetHoursPerDay: 8,
        targetDaysPerWeek: 5,
        targetWeeksPerYear: 45,
        nonBillablePercentage: 15,
        actualCurrentAnnualNetIncome: 38000,
        minimumAcceptableRate: 80,
        createdAt: new Date('2024-02-01').toISOString()
    },
    {
        id: 'profile-3',
        collaboratorId: 'collab-3',
        year: 2024,
        expenses: [
            { id: generateId(), category: 'Rent/Mortgage', amount: 2200 },
            { id: generateId(), category: 'Utilities', amount: 180 },
            { id: generateId(), category: 'Healthcare', amount: 400 },
            { id: generateId(), category: 'Groceries', amount: 450 },
            { id: generateId(), category: 'Transportation', amount: 250 },
            { id: generateId(), category: 'Student Loans', amount: 500 }
        ],
        targetHoursPerDay: 6,
        targetDaysPerWeek: 5,
        targetWeeksPerYear: 40,
        nonBillablePercentage: 25,
        actualCurrentAnnualNetIncome: 32000,
        minimumAcceptableRate: 90,
        createdAt: new Date('2024-02-10').toISOString()
    }
];

export const demoProjects = [
    {
        id: 'project-1',
        name: 'Echoes of Movement',
        description: 'An experimental dance piece exploring themes of memory and identity',
        status: 'active',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        phases: [
            {
                id: 'phase-1',
                name: 'Creation',
                durationWeeks: 12,
                workloadHoursPerWeek: 30,
                startDate: '2024-03-01'
            },
            {
                id: 'phase-2',
                name: 'Rehearsal',
                durationWeeks: 8,
                workloadHoursPerWeek: 35,
                startDate: '2024-05-24'
            },
            {
                id: 'phase-3',
                name: 'Touring',
                durationWeeks: 10,
                workloadHoursPerWeek: 25,
                startDate: '2024-09-01'
            }
        ],
        incomeSources: [
            {
                id: 'income-1',
                name: 'NEA Grant',
                amount: 75000,
                status: 'confirmed',
                receivedDate: '2024-01-15'
            },
            {
                id: 'income-2',
                name: 'Mellon Foundation',
                amount: 50000,
                status: 'confirmed',
                receivedDate: '2024-02-01'
            },
            {
                id: 'income-3',
                name: 'Box Office Revenue',
                amount: 30000,
                status: 'likely',
                receivedDate: null
            },
            {
                id: 'income-4',
                name: 'Touring Fees',
                amount: 45000,
                status: 'likely',
                receivedDate: null
            }
        ],
        createdAt: new Date('2024-01-10').toISOString()
    }
];

export const demoScenarios = [
    {
        id: 'scenario-1',
        projectId: 'project-1',
        name: 'Dream Scenario',
        description: 'Full funding achieved - everyone paid at 100% of goal rate',
        wageFloor: 100,
        percentageOfGoal: 100,
        createdAt: new Date('2024-01-10').toISOString()
    },
    {
        id: 'scenario-2',
        projectId: 'project-1',
        name: 'Realistic Scenario',
        description: 'Confirmed funding only - 65% of goal rate with $100 floor',
        wageFloor: 100,
        percentageOfGoal: 65,
        createdAt: new Date('2024-01-10').toISOString()
    },
    {
        id: 'scenario-3',
        projectId: 'project-1',
        name: 'Bare Bones',
        description: 'Minimum viable - 50% of goal rate with $80 floor',
        wageFloor: 80,
        percentageOfGoal: 50,
        createdAt: new Date('2024-01-10').toISOString()
    }
];

export const demoLineItems = [
    // Dream Scenario Labor Items
    {
        id: 'line-1',
        scenarioId: 'scenario-1',
        type: 'labor',
        collaboratorId: 'collab-1',
        phaseId: 'phase-1',
        description: 'Choreography - Creation Phase',
        cost: 42120 // Will be calculated
    },
    {
        id: 'line-2',
        scenarioId: 'scenario-1',
        type: 'labor',
        collaboratorId: 'collab-2',
        phaseId: 'phase-2',
        description: 'Sound Design - Rehearsal Phase',
        cost: 22880
    },
    {
        id: 'line-3',
        scenarioId: 'scenario-1',
        type: 'labor',
        collaboratorId: 'collab-3',
        phaseId: 'phase-3',
        description: 'Lighting Design - Touring Phase',
        cost: 22500
    },
    // Dream Scenario Expenses
    {
        id: 'line-4',
        scenarioId: 'scenario-1',
        type: 'expense',
        category: 'Travel',
        description: 'Tour transportation and accommodation',
        cost: 25000
    },
    {
        id: 'line-5',
        scenarioId: 'scenario-1',
        type: 'expense',
        category: 'Materials',
        description: 'Set design and costumes',
        cost: 15000
    },
    {
        id: 'line-6',
        scenarioId: 'scenario-1',
        type: 'expense',
        category: 'Accessibility',
        description: 'ASL interpretation and audio description',
        cost: 8000
    },
    // Realistic Scenario Items
    {
        id: 'line-7',
        scenarioId: 'scenario-2',
        type: 'labor',
        collaboratorId: 'collab-1',
        phaseId: 'phase-1',
        description: 'Choreography - Creation Phase',
        cost: 36000
    },
    {
        id: 'line-8',
        scenarioId: 'scenario-2',
        type: 'labor',
        collaboratorId: 'collab-2',
        phaseId: 'phase-2',
        description: 'Sound Design - Rehearsal Phase',
        cost: 22400
    },
    {
        id: 'line-9',
        scenarioId: 'scenario-2',
        type: 'expense',
        category: 'Travel',
        description: 'Tour transportation',
        cost: 18000
    }
];

export const demoEquityLogs = [
    {
        id: 'equity-1',
        collaboratorId: 'collab-1',
        projectId: 'project-1',
        scenarioId: 'scenario-2',
        goalRate: 117,
        actualRate: 100,
        hoursWorked: 360,
        sharesEarned: 6120, // (117-100) * 360
        createdAt: new Date('2024-03-01').toISOString()
    }
];

export function loadDemoData() {
    return {
        collaborators: demoCollaborators,
        financialProfiles: demoFinancialProfiles,
        projects: demoProjects,
        scenarios: demoScenarios,
        lineItems: demoLineItems,
        equityLogs: demoEquityLogs
    };
}
