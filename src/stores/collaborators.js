import { defineStore } from 'pinia';
import { generateId } from '../utils/calculations.js';

export const useCollaboratorsStore = defineStore('collaborators', {
    state: () => ({
        collaborators: []
    }),

    getters: {
        getById: (state) => (id) => {
            return state.collaborators.find(c => c.id === id);
        },

        getAllCollaborators: (state) => {
            return state.collaborators;
        },

        sortedByName: (state) => {
            return [...state.collaborators].sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }
    },

    actions: {
        addCollaborator(collaborator) {
            const newCollaborator = {
                id: generateId(),
                ...collaborator,
                createdAt: new Date().toISOString()
            };
            this.collaborators.push(newCollaborator);
            this.saveToLocalStorage();
            return newCollaborator;
        },

        updateCollaborator(id, updates) {
            const index = this.collaborators.findIndex(c => c.id === id);
            if (index !== -1) {
                this.collaborators[index] = {
                    ...this.collaborators[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteCollaborator(id) {
            const index = this.collaborators.findIndex(c => c.id === id);
            if (index !== -1) {
                this.collaborators.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        loadFromLocalStorage() {
            const data = localStorage.getItem('collaborators');
            if (data) {
                this.collaborators = JSON.parse(data);
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('collaborators', JSON.stringify(this.collaborators));
        },

        initializeWithDemoData(demoCollaborators) {
            this.collaborators = demoCollaborators;
            this.saveToLocalStorage();
        }
    }
});
