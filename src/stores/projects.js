import { defineStore } from 'pinia';
import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { generateId } from '../utils/calculations';

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        activeProject: null,
        loading: false,
        error: null,
        unsubscribe: null
    }),

    getters: {
        getById: (state) => (id) => {
            return state.projects.find(p => p.id === id);
        },

        myProjects: (state) => {
            const uid = auth.currentUser?.uid;
            if (!uid) return [];
            return state.projects.filter(p => p.ownerId === uid);
        },

        sharedProjects: (state) => {
            const uid = auth.currentUser?.uid;
            if (!uid) return [];
            return state.projects.filter(p => p.ownerId !== uid);
        }
    },

    actions: {
        async fetchProjects() {
            const user = auth.currentUser;
            if (!user) return;

            this.loading = true;
            try {
                if (this.unsubscribe) this.unsubscribe();

                const projectsRef = collection(db, 'projects');
                // For MVP, we might need two queries or a composite index.
                // To keep it simple, let's just query for projects where I am the owner for now.
                // TODO: Add complex query for "members" array-contains check once we implement invites.

                const q = query(projectsRef, where('ownerId', '==', user.uid));

                this.unsubscribe = onSnapshot(q, (snapshot) => {
                    this.projects = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    this.loading = false;
                }, (error) => {
                    console.error("Error fetching projects:", error);
                    this.error = error.message;
                    this.loading = false;
                });

            } catch (error) {
                this.error = error.message;
                this.loading = false;
            }
        },

        async addProject(project) {
            const user = auth.currentUser;
            if (!user) throw new Error("Must be logged in");

            try {
                const newProject = {
                    ...project,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    status: 'Active',
                    scenarios: {}, // Map for scenarios
                    incomeSources: [],
                    phases: [],
                    members: {
                        [user.uid]: { role: 'owner' }
                    }
                };

                const docRef = await addDoc(collection(db, 'projects'), newProject);
                return { id: docRef.id, ...newProject };
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async updateProject(id, updates) {
            try {
                const projectRef = doc(db, 'projects', id);
                await updateDoc(projectRef, {
                    ...updates,
                    updatedAt: serverTimestamp()
                });
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async deleteProject(id) {
            try {
                await deleteDoc(doc(db, 'projects', id));
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // Sub-collection management (simulated with nested fields for now as per plan)

        async addScenario(projectId, scenario) {
            const project = this.getById(projectId);
            if (!project) return;

            const scenarioId = generateId();
            const newScenario = { id: scenarioId, ...scenario };

            const updates = {
                [`scenarios.${scenarioId}`]: newScenario
            };

            await this.updateProject(projectId, updates);
            return newScenario;
        },

        async updateScenario(projectId, scenarioId, updates) {
            const project = this.getById(projectId);
            if (!project) return;

            // We need to merge updates carefully
            const currentScenario = project.scenarios[scenarioId];
            const updatedScenario = { ...currentScenario, ...updates };

            const firestoreUpdates = {
                [`scenarios.${scenarioId}`]: updatedScenario
            };

            await this.updateProject(projectId, firestoreUpdates);
        },

        async deleteScenario(projectId, scenarioId) {
            // Firestore delete field syntax
            // We can't easily delete a map key without replacing the map or using FieldValue.delete()
            // For now, let's just re-write the scenarios object without this key
            const project = this.getById(projectId);
            if (!project) return;

            const newScenarios = { ...project.scenarios };
            delete newScenarios[scenarioId];

            await this.updateProject(projectId, { scenarios: newScenarios });
        },

        async addIncomeSource(projectId, source) {
            const project = this.getById(projectId);
            if (!project) return;

            const newSource = { id: generateId(), ...source };
            const newIncomeSources = [...(project.incomeSources || []), newSource];

            await this.updateProject(projectId, { incomeSources: newIncomeSources });
            return newSource;
        },

        // ... similar helpers for updating/deleting income sources and phases could be added
        // but for MVP we might just update the whole array if needed.

        cleanup() {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            this.projects = [];
        }
    }
});
