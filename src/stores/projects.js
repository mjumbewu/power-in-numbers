import { defineStore } from 'pinia';
import { generateId } from '../utils/calculations.js';

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: []
    }),

    getters: {
        getById: (state) => (id) => {
            return state.projects.find(p => p.id === id);
        },

        getAllProjects: (state) => {
            return state.projects;
        },

        activeProjects: (state) => {
            return state.projects.filter(p => p.status === 'active');
        },

        getPhases: (state) => (projectId) => {
            const project = state.projects.find(p => p.id === projectId);
            return project?.phases || [];
        },

        getIncomeSources: (state) => (projectId) => {
            const project = state.projects.find(p => p.id === projectId);
            return project?.incomeSources || [];
        }
    },

    actions: {
        addProject(project) {
            const newProject = {
                id: generateId(),
                ...project,
                phases: project.phases || [],
                incomeSources: project.incomeSources || [],
                status: project.status || 'planning',
                createdAt: new Date().toISOString()
            };
            this.projects.push(newProject);
            this.saveToLocalStorage();
            return newProject;
        },

        updateProject(id, updates) {
            const index = this.projects.findIndex(p => p.id === id);
            if (index !== -1) {
                this.projects[index] = {
                    ...this.projects[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveToLocalStorage();
            }
        },

        deleteProject(id) {
            const index = this.projects.findIndex(p => p.id === id);
            if (index !== -1) {
                this.projects.splice(index, 1);
                this.saveToLocalStorage();
            }
        },

        // Phase management
        addPhase(projectId, phase) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const newPhase = {
                    id: generateId(),
                    ...phase
                };
                project.phases.push(newPhase);
                this.saveToLocalStorage();
                return newPhase;
            }
        },

        updatePhase(projectId, phaseId, updates) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const phaseIndex = project.phases.findIndex(ph => ph.id === phaseId);
                if (phaseIndex !== -1) {
                    project.phases[phaseIndex] = {
                        ...project.phases[phaseIndex],
                        ...updates
                    };
                    this.saveToLocalStorage();
                }
            }
        },

        deletePhase(projectId, phaseId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const phaseIndex = project.phases.findIndex(ph => ph.id === phaseId);
                if (phaseIndex !== -1) {
                    project.phases.splice(phaseIndex, 1);
                    this.saveToLocalStorage();
                }
            }
        },

        // Income source management
        addIncomeSource(projectId, source) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const newSource = {
                    id: generateId(),
                    ...source,
                    status: source.status || 'likely'
                };
                project.incomeSources.push(newSource);
                this.saveToLocalStorage();
                return newSource;
            }
        },

        updateIncomeSource(projectId, sourceId, updates) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const sourceIndex = project.incomeSources.findIndex(s => s.id === sourceId);
                if (sourceIndex !== -1) {
                    project.incomeSources[sourceIndex] = {
                        ...project.incomeSources[sourceIndex],
                        ...updates
                    };
                    this.saveToLocalStorage();
                }
            }
        },

        deleteIncomeSource(projectId, sourceId) {
            const project = this.projects.find(p => p.id === projectId);
            if (project) {
                const sourceIndex = project.incomeSources.findIndex(s => s.id === sourceId);
                if (sourceIndex !== -1) {
                    project.incomeSources.splice(sourceIndex, 1);
                    this.saveToLocalStorage();
                }
            }
        },

        loadFromLocalStorage() {
            const data = localStorage.getItem('projects');
            if (data) {
                this.projects = JSON.parse(data);
            }
        },

        saveToLocalStorage() {
            localStorage.setItem('projects', JSON.stringify(this.projects));
        },

        initializeWithDemoData(demoProjects) {
            this.projects = demoProjects;
            this.saveToLocalStorage();
        }
    }
});
