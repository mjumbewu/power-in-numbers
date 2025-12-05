import { defineStore } from 'pinia';
import { generateId, calculateLaborCost, calculateScenarioBudget } from '../utils/calculations.js';
import { useFinancialProfilesStore } from './financialProfiles.js';
import { useProjectsStore } from './projects.js';

export const useScenariosStore = defineStore('scenarios', {
    state: () => ({
        scenarios: [],
        lineItems: []
    }),

    getters: {
        getById: (state) => (id) => {
            return state.scenarios.find(s => s.id === id);
        },

        getByProjectId: (state) => (projectId) => {
            return state.scenarios.filter(s => s.projectId === projectId);
        },

        getLineItems: (state) => (scenarioId) => {
            return state.lineItems.filter(item => item.scenarioId === scenarioId);
        },

        getLaborLineItems: (state) => (scenarioId) => {
            return state.lineItems.filter(item =>
                item.scenarioId === scenarioId && item.type === 'labor'
            );
        },

        getExpenseLineItems: (state) => (scenarioId) => {
            return state.lineItems.filter(item =>
                item.scenarioId === scenarioId && item.type === 'expense'
            );
        },

        getScenarioBudget: (state) => (scenarioId) => {
            const items = state.lineItems.filter(item => item.scenarioId === scenarioId);
            return calculateScenarioBudget(items);
        }
    },

    actions: {
        addScenario(scenario) {
            const newScenario = {
                id: generateId(),
                ...scenario,
                createdAt: new Date().toISOString()
            };
            this.scenarios.push(newScenario);
            this.saveToLocalStorage();
            return newScenario;
        },

        updateScenario(id, updates) {
            const index = this.scenarios.findIndex(s => s.id === id);
            if (index !== -1) {
                this.scenarios[index] = {
                    ...this.scenarios[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteScenario(id) {
            // Delete scenario and all its line items
            this.lineItems = this.lineItems.filter(item => item.scenarioId !== id);
            const index = this.scenarios.findIndex(s => s.id === id);
            if (index !== -1) {
                this.scenarios.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        // Line item management
        addLaborLineItem({ scenarioId, collaboratorId, phaseId, description }) {
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (!scenario) { return; }

            const financialProfilesStore = useFinancialProfilesStore();
            const projectsStore = useProjectsStore();

            // Get collaborator's goal rate
            const profile = financialProfilesStore.getCurrentProfile(collaboratorId);
            if (!profile) return;

            const rates = financialProfilesStore.getCalculatedRates(profile.id);
            if (!rates) return;

            // Get phase details
            const project = projectsStore.getById(scenario.projectId);
            const phase = project?.phases.find(p => p.id === phaseId);
            if (!phase) return;

            // Calculate labor cost with scenario rules
            const laborCalc = calculateLaborCost({
                personalGoalRate: rates.goalHourly,
                hoursPerWeek: phase.workloadHoursPerWeek,
                durationWeeks: phase.durationWeeks,
                scenarioRules: {
                    wageFloor: scenario.wageFloor,
                    percentageOfGoal: scenario.percentageOfGoal
                }
            });

            const newLineItem = {
                id: generateId(),
                scenarioId,
                type: 'labor',
                collaboratorId,
                phaseId,
                description: description || `${phase.name} - Labor`,
                cost: laborCalc.actualPay,
                rate: laborCalc.calculatedRate,
                hours: laborCalc.totalHours,
                producerialShares: laborCalc.producerialShares,
                createdAt: new Date().toISOString()
            };

            this.lineItems.push(newLineItem);
            this.saveToLocalStorage();
            return newLineItem;
        },

        addExpenseLineItem({ scenarioId, category, description, cost }) {
            const newLineItem = {
                id: generateId(),
                scenarioId,
                type: 'expense',
                category,
                description,
                cost: parseFloat(cost) || 0,
                createdAt: new Date().toISOString()
            };

            this.lineItems.push(newLineItem);
            this.saveToLocalStorage();
            return newLineItem;
        },

        updateLineItem(id, updates) {
            const index = this.lineItems.findIndex(item => item.id === id);
            if (index !== -1) {
                this.lineItems[index] = {
                    ...this.lineItems[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteLineItem(id) {
            const index = this.lineItems.findIndex(item => item.id === id);
            if (index !== -1) {
                this.lineItems.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        recalculateScenario(scenarioId) {
            // Recalculate all labor line items for a scenario
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (!scenario) return;

            const laborItems = this.lineItems.filter(
                item => item.scenarioId === scenarioId && item.type === 'labor'
            );

            const financialProfilesStore = useFinancialProfilesStore();
            const projectsStore = useProjectsStore();
            const project = projectsStore.getById(scenario.projectId);

            laborItems.forEach(item => {
                const profile = financialProfilesStore.getCurrentProfile(item.collaboratorId);
                if (!profile) return;

                const rates = financialProfilesStore.getCalculatedRates(profile.id);
                if (!rates) return;

                const phase = project?.phases.find(p => p.id === item.phaseId);
                if (!phase) return;

                const laborCalc = calculateLaborCost({
                    personalGoalRate: rates.goalHourly,
                    hoursPerWeek: phase.workloadHoursPerWeek,
                    durationWeeks: phase.durationWeeks,
                    scenarioRules: {
                        wageFloor: scenario.wageFloor,
                        percentageOfGoal: scenario.percentageOfGoal
                    }
                });

                this.updateLineItem(item.id, {
                    cost: laborCalc.actualPay,
                    rate: laborCalc.calculatedRate,
                    hours: laborCalc.totalHours,
                    producerialShares: laborCalc.producerialShares
                });
            });
        },

        loadFromLocalStorage() {
            const scenariosData = localStorage.getItem('scenarios');
            const lineItemsData = localStorage.getItem('lineItems');

            if (scenariosData) {
                this.scenarios = JSON.parse(scenariosData);
            }
            if (lineItemsData) {
                this.lineItems = JSON.parse(lineItemsData);
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('scenarios', JSON.stringify(this.scenarios));
            localStorage.setItem('lineItems', JSON.stringify(this.lineItems));
        },

        initializeWithDemoData(demoScenarios, demoLineItems) {
            this.scenarios = demoScenarios;
            this.lineItems = demoLineItems;
            this.saveToLocalStorage();
        }
    }
});
