import { defineStore } from 'pinia';
import { generateId } from '../utils/calculations.js';

export const useEquityStore = defineStore('equity', {
    state: () => ({
        equityLogs: []
    }),

    getters: {
        getByCollaboratorId: (state) => (collaboratorId) => {
            return state.equityLogs.filter(log => log.collaboratorId === collaboratorId);
        },

        getByProjectId: (state) => (projectId) => {
            return state.equityLogs.filter(log => log.projectId === projectId);
        },

        getTotalSharesForCollaborator: (state) => (collaboratorId) => {
            const logs = state.equityLogs.filter(log => log.collaboratorId === collaboratorId);
            return logs.reduce((total, log) => total + (log.sharesEarned || 0), 0);
        },

        getTotalSharesForProject: (state) => (projectId) => {
            const logs = state.equityLogs.filter(log => log.projectId === projectId);
            return logs.reduce((total, log) => total + (log.sharesEarned || 0), 0);
        }
    },

    actions: {
        addEquityLog(log) {
            const newLog = {
                id: generateId(),
                ...log,
                createdAt: new Date().toISOString()
            };
            this.equityLogs.push(newLog);
            this.saveToLocalStorage();
            return newLog;
        },

        updateEquityLog(id, updates) {
            const index = this.equityLogs.findIndex(log => log.id === id);
            if (index !== -1) {
                this.equityLogs[index] = {
                    ...this.equityLogs[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteEquityLog(id) {
            const index = this.equityLogs.findIndex(log => log.id === id);
            if (index !== -1) {
                this.equityLogs.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        loadFromLocalStorage() {
            const data = localStorage.getItem('equityLogs');
            if (data) {
                this.equityLogs = JSON.parse(data);
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('equityLogs', JSON.stringify(this.equityLogs));
        },

        initializeWithDemoData(demoEquityLogs) {
            this.equityLogs = demoEquityLogs;
            this.saveToLocalStorage();
        }
    }
});
