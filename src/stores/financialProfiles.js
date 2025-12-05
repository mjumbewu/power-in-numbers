import { defineStore } from 'pinia';
import { generateId, calculatePersonalRates } from '../utils/calculations.js';

export const useFinancialProfilesStore = defineStore('financialProfiles', {
    state: () => ({
        profiles: []
    }),

    getters: {
        getById: (state) => (id) => {
            return state.profiles.find(p => p.id === id);
        },

        getByCollaboratorId: (state) => (collaboratorId) => {
            return state.profiles.filter(p => p.collaboratorId === collaboratorId);
        },

        getCurrentProfile: (state) => (collaboratorId) => {
            const currentYear = new Date().getFullYear();
            const profiles = state.profiles.filter(p => p.collaboratorId === collaboratorId);
            return profiles.find(p => p.year === currentYear) || profiles[profiles.length - 1];
        },

        getCalculatedRates: (state) => (profileId) => {
            const profile = state.profiles.find(p => p.id === profileId);
            if (!profile) return null;
            return calculatePersonalRates(profile);
        }
    },

    actions: {
        addProfile(profile) {
            const newProfile = {
                id: generateId(),
                ...profile,
                expenses: profile.expenses || [],
                createdAt: new Date().toISOString()
            };
            this.profiles.push(newProfile);
            this.saveToLocalStorage();
            return newProfile;
        },

        updateProfile(id, updates) {
            const index = this.profiles.findIndex(p => p.id === id);
            if (index !== -1) {
                this.profiles[index] = {
                    ...this.profiles[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteProfile(id) {
            const index = this.profiles.findIndex(p => p.id === id);
            if (index !== -1) {
                this.profiles.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        addExpense(profileId, expense) {
            const profile = this.profiles.find(p => p.id === profileId);
            if (profile) {
                const newExpense = {
                    id: generateId(),
                    ...expense
                };
                profile.expenses.push(newExpense);
                this.saveToLocalStorage();
                return newExpense;
            }
        },

        updateExpense(profileId, expenseId, updates) {
            const profile = this.profiles.find(p => p.id === profileId);
            if (profile) {
                const expenseIndex = profile.expenses.findIndex(e => e.id === expenseId);
                if (expenseIndex !== -1) {
                    profile.expenses[expenseIndex] = {
                        ...profile.expenses[expenseIndex],
                        ...updates
                    };
                    this.saveToLocalStorage();
                }
            }
        },

        deleteExpense(profileId, expenseId) {
            const profile = this.profiles.find(p => p.id === profileId);
            if (profile) {
                const expenseIndex = profile.expenses.findIndex(e => e.id === expenseId);
                if (expenseIndex !== -1) {
                    profile.expenses.splice(expenseIndex, 1);
                    this.saveToLocalStorage();
                }
            }
        },

        loadFromLocalStorage() {
            const data = localStorage.getItem('financialProfiles');
            if (data) {
                this.profiles = JSON.parse(data);
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('financialProfiles', JSON.stringify(this.profiles));
        },

        initializeWithDemoData(demoProfiles) {
            this.profiles = demoProfiles;
            this.saveToLocalStorage();
        }
    }
});
