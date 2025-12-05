import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles/index.css';

// Import stores
import { useCollaboratorsStore } from './stores/collaborators.js';
import { useFinancialProfilesStore } from './stores/financialProfiles.js';
import { useProjectsStore } from './stores/projects.js';
import { useScenariosStore } from './stores/scenarios.js';
import { useEquityStore } from './stores/equity.js';

// Import demo data
import { loadDemoData } from './utils/demoData.js';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize stores with data from localStorage or demo data
const initializeStores = () => {
    const collaboratorsStore = useCollaboratorsStore();
    const financialProfilesStore = useFinancialProfilesStore();
    const projectsStore = useProjectsStore();
    const scenariosStore = useScenariosStore();
    const equityStore = useEquityStore();

    // Try to load from localStorage
    collaboratorsStore.loadFromLocalStorage();
    financialProfilesStore.loadFromLocalStorage();
    projectsStore.loadFromLocalStorage();
    scenariosStore.loadFromLocalStorage();
    equityStore.loadFromLocalStorage();

    // If no data exists, load demo data
    if (collaboratorsStore.collaborators.length === 0) {
        const demoData = loadDemoData();

        collaboratorsStore.initializeWithDemoData(demoData.collaborators);
        financialProfilesStore.initializeWithDemoData(demoData.financialProfiles);
        projectsStore.initializeWithDemoData(demoData.projects);
        scenariosStore.initializeWithDemoData(demoData.scenarios, demoData.lineItems);
        equityStore.initializeWithDemoData(demoData.equityLogs);

        console.log('Demo data loaded successfully');
    }
};

initializeStores();

app.mount('#app');
