<template>
  <div v-if="project" class="project-detail-view fade-in">
    <button @click="$router.back()" class="btn btn-secondary mb-lg">← Back to Projects</button>

    <div class="project-header">
      <div>
        <h1>{{ project.name }}</h1>
        <p class="text-secondary">{{ project.description }}</p>
      </div>
      <span class="badge badge-lg" :class="`badge-${getStatusColor(project.status)}`">
        {{ project.status }}
      </span>
    </div>

    <div class="tabs">
      <button @click="activeTab = 'scenarios'"
              class="tab"
              :class="{ active: activeTab === 'scenarios' }">
        Budget Scenarios
      </button>
      <button @click="activeTab = 'phases'"
              class="tab"
              :class="{ active: activeTab === 'phases' }">
        Phases
      </button>
      <button @click="activeTab = 'income'"
              class="tab"
              :class="{ active: activeTab === 'income' }">
        Income Sources
      </button>
    </div>

    <!-- Budget Scenarios Tab -->
    <div v-if="activeTab === 'scenarios'" class="tab-content">
      <div class="section-header">
        <h2>Budget Scenarios</h2>
        <button @click="showScenarioForm = true" class="btn btn-primary">+ Add Scenario</button>
      </div>

      <div v-if="showScenarioForm" class="card mb-lg">
        <div class="card-header">
          <h3>Create Budget Scenario</h3>
          <button @click="showScenarioForm = false" class="btn btn-sm btn-secondary">Cancel</button>
        </div>
        <form @submit.prevent="handleCreateScenario" class="card-body">
          <div class="form-group">
            <label class="form-label">Scenario Name *</label>
            <input v-model="newScenario.name" type="text" class="form-input" required placeholder="e.g., Dream Scenario" />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="newScenario.description" class="form-textarea" placeholder="Brief description"></textarea>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Wage Floor ($/hr)</label>
              <input v-model.number="newScenario.wageFloor" type="number" class="form-input" placeholder="100" />
            </div>

            <div class="form-group">
              <label class="form-label">% of Goal Rate</label>
              <input v-model.number="newScenario.percentageOfGoal" type="number" class="form-input" min="0" max="200" placeholder="65" />
            </div>
          </div>

          <button type="submit" class="btn btn-accent">Create Scenario</button>
        </form>
      </div>

      <div v-if="scenarios.length === 0" class="empty-state card">
        <p class="text-muted">No budget scenarios yet. Create one to start budgeting!</p>
      </div>

      <div v-else class="scenarios-grid grid grid-cols-3">
        <div v-for="scenario in scenarios" :key="scenario.id" class="scenario-card card">
          <div class="card-header">
            <h3>{{ scenario.name }}</h3>
          </div>
          <div class="card-body">
            <p class="text-secondary mb-md">{{ scenario.description }}</p>

            <div class="scenario-rules mb-md">
              <div class="rule">
                <span class="rule-label">Wage Floor:</span>
                <span class="rule-value">{{ formatCurrency(scenario.wageFloor) }}/hr</span>
              </div>
              <div class="rule">
                <span class="rule-label">% of Goal:</span>
                <span class="rule-value">{{ scenario.percentageOfGoal }}%</span>
              </div>
            </div>

            <div class="scenario-budget">
              <div class="budget-summary">
                <strong>Total Budget:</strong>
                <strong class="budget-value">{{ formatCurrency(getScenarioBudget(scenario.id).total) }}</strong>
              </div>
              <div class="budget-breakdown">
                <span class="text-muted">Labor: {{ formatCurrency(getScenarioBudget(scenario.id).laborCosts) }}</span>
                <span class="text-muted">Expenses: {{ formatCurrency(getScenarioBudget(scenario.id).expenseCosts) }}</span>
              </div>
            </div>

            <div class="scenario-actions mt-md">
              <button @click="deleteScenario(scenario.id)" class="btn btn-sm btn-secondary">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phases Tab -->
    <div v-if="activeTab === 'phases'" class="tab-content">
      <div class="section-header">
        <h2>Project Phases</h2>
        <button @click="showPhaseForm = !showPhaseForm" class="btn btn-primary">+ Add Phase</button>
      </div>

      <div v-if="showPhaseForm" class="card mb-lg">
        <form @submit.prevent="handleCreatePhase" class="card-body">
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Phase Name *</label>
              <input v-model="newPhase.name" type="text" class="form-input" required placeholder="e.g., Creation" />
            </div>
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input v-model="newPhase.startDate" type="date" class="form-input" />
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Duration (weeks)</label>
              <input v-model.number="newPhase.durationWeeks" type="number" class="form-input" placeholder="12" />
            </div>
            <div class="form-group">
              <label class="form-label">Hours per Week</label>
              <input v-model.number="newPhase.workloadHoursPerWeek" type="number" class="form-input" placeholder="30" />
            </div>
          </div>

          <button type="submit" class="btn btn-accent">Add Phase</button>
        </form>
      </div>

      <div v-if="!project.phases || project.phases.length === 0" class="empty-state card">
        <p class="text-muted">No phases yet. Add phases to organize your project timeline!</p>
      </div>

      <div v-else class="phases-list">
        <div v-for="phase in project.phases" :key="phase.id" class="phase-card card">
          <h3>{{ phase.name }}</h3>
          <div class="phase-details">
            <div class="detail-item">
              <span class="detail-label">Duration:</span>
              <span>{{ phase.durationWeeks }} weeks</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Workload:</span>
              <span>{{ phase.workloadHoursPerWeek }} hrs/week</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Hours:</span>
              <span>{{ phase.durationWeeks * phase.workloadHoursPerWeek }} hours</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Start Date:</span>
              <span>{{ phase.startDate || 'TBD' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Income Sources Tab -->
    <div v-if="activeTab === 'income'" class="tab-content">
      <div class="section-header">
        <h2>Income Sources</h2>
        <button @click="showIncomeForm = !showIncomeForm" class="btn btn-primary">+ Add Income Source</button>
      </div>

      <div v-if="showIncomeForm" class="card mb-lg">
        <form @submit.prevent="handleCreateIncomeSource" class="card-body">
          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Source Name *</label>
              <input v-model="newIncomeSource.name" type="text" class="form-input" required placeholder="e.g., NEA Grant" />
            </div>
            <div class="form-group">
              <label class="form-label">Amount ($)</label>
              <input v-model.number="newIncomeSource.amount" type="number" class="form-input" placeholder="50000" />
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="newIncomeSource.status" class="form-select">
                <option value="confirmed">Confirmed</option>
                <option value="likely">Likely</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Received Date</label>
              <input v-model="newIncomeSource.receivedDate" type="date" class="form-input" />
            </div>
          </div>

          <button type="submit" class="btn btn-accent">Add Income Source</button>
        </form>
      </div>

      <div v-if="!project.incomeSources || project.incomeSources.length === 0" class="empty-state card">
        <p class="text-muted">No income sources yet. Add funding sources to track your project budget!</p>
      </div>

      <div v-else>
        <div class="income-summary card mb-lg">
          <h3>Funding Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Confirmed Income</div>
              <div class="summary-value confirmed">{{ formatCurrency(confirmedIncome) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Likely Income</div>
              <div class="summary-value likely">{{ formatCurrency(likelyIncome) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Income</div>
              <div class="summary-value total">{{ formatCurrency(totalIncome) }}</div>
            </div>
          </div>
        </div>

        <div class="income-list">
          <div v-for="source in project.incomeSources" :key="source.id" class="income-card card">
            <div class="income-header">
              <h3>{{ source.name }}</h3>
              <span class="badge" :class="source.status === 'confirmed' ? 'badge-success' : 'badge-warning'">
                {{ source.status }}
              </span>
            </div>
            <div class="income-details">
              <div class="income-amount">{{ formatCurrency(source.amount) }}</div>
              <div class="income-date text-muted">
                {{ source.receivedDate ? `Received: ${source.receivedDate}` : 'Pending' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>Loading project...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '../stores/projects.js';
import { useScenariosStore } from '../stores/scenarios.js';
import { formatCurrency } from '../utils/calculations.js';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const scenariosStore = useScenariosStore();

const activeTab = ref('scenarios');
const showScenarioForm = ref(false);
const showPhaseForm = ref(false);
const showIncomeForm = ref(false);

const newScenario = ref({
  name: '',
  description: '',
  wageFloor: 100,
  percentageOfGoal: 65
});

const newPhase = ref({
  name: '',
  startDate: '',
  durationWeeks: 12,
  workloadHoursPerWeek: 30
});

const newIncomeSource = ref({
  name: '',
  amount: 0,
  status: 'likely',
  receivedDate: ''
});

const project = computed(() => {
  return projectsStore.getById(route.params.id);
});

const scenarios = computed(() => {
  return scenariosStore.getByProjectId(route.params.id);
});

const confirmedIncome = computed(() => {
  return project.value?.incomeSources
    ?.filter(s => s.status === 'confirmed')
    .reduce((sum, s) => sum + s.amount, 0) || 0;
});

const likelyIncome = computed(() => {
  return project.value?.incomeSources
    ?.filter(s => s.status === 'likely')
    .reduce((sum, s) => sum + s.amount, 0) || 0;
});

const totalIncome = computed(() => confirmedIncome.value + likelyIncome.value);

function getStatusColor(status) {
  const colors = {
    active: 'success',
    planning: 'info',
    completed: 'primary',
    paused: 'warning'
  };
  return colors[status] || 'primary';
}

function getScenarioBudget(scenarioId) {
  return scenariosStore.getScenarioBudget(scenarioId);
}

function handleCreateScenario() {
  scenariosStore.addScenario({
    projectId: route.params.id,
    ...newScenario.value
  });
  newScenario.value = {
    name: '',
    description: '',
    wageFloor: 100,
    percentageOfGoal: 65
  };
  showScenarioForm.value = false;
}

function handleCreatePhase() {
  projectsStore.addPhase(route.params.id, { ...newPhase.value });
  newPhase.value = {
    name: '',
    startDate: '',
    durationWeeks: 12,
    workloadHoursPerWeek: 30
  };
  showPhaseForm.value = false;
}

function handleCreateIncomeSource() {
  projectsStore.addIncomeSource(route.params.id, { ...newIncomeSource.value });
  newIncomeSource.value = {
    name: '',
    amount: 0,
    status: 'likely',
    receivedDate: ''
  };
  showIncomeForm.value = false;
}

function deleteScenario(id) {
  if (confirm('Delete this scenario and all its line items?')) {
    scenariosStore.deleteScenario(id);
  }
}

onMounted(() => {
  if (!project.value) {
    router.push('/projects');
  }
});
</script>

<style scoped>
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl);
}

.badge-lg {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-base);
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  border-bottom: 2px solid var(--color-border);
}

.tab {
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-base);
}

.tab::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform var(--transition-base);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  transform: scaleX(1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.scenarios-grid {
  gap: var(--space-lg);
}

.scenario-rules {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.rule {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.rule-label {
  color: var(--color-text-muted);
}

.rule-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.scenario-budget {
  padding: var(--space-md);
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.budget-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.budget-value {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
}

.budget-breakdown {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
}

.phases-list {
  display: grid;
  gap: var(--space-md);
}

.phase-card h3 {
  margin-bottom: var(--space-md);
}

.phase-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.detail-item {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.income-summary {
  background: var(--gradient-card);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.summary-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.summary-value.confirmed {
  color: var(--color-success);
}

.summary-value.likely {
  color: var(--color-warning);
}

.summary-value.total {
  color: var(--color-primary);
}

.income-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.income-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.income-amount {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.income-date {
  font-size: var(--font-size-sm);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}
</style>
