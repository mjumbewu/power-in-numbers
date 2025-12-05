<template>
  <div class="project-detail-view container" v-if="project">
    <div class="header-section mb-xl">
      <div class="flex items-center gap-sm text-sm text-secondary mb-sm">
        <router-link to="/projects">Projects</router-link>
        <span>/</span>
        <span>{{ project.name }}</span>
      </div>

      <div class="flex justify-between items-start">
        <div>
          <h1 class="page-title">{{ project.name }}</h1>
          <div class="flex items-center gap-md">
            <span class="badge" :class="getStatusClass(project.status)">{{ project.status }}</span>
            <span class="text-secondary text-sm">Created {{ formatDate(project.createdAt) }}</span>
          </div>
        </div>
        <div class="flex gap-sm">
          <button @click="showInviteModal = true" class="btn btn-secondary">
            + Invite Collaborator
          </button>
          <button @click="saveProject" class="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs mb-lg">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="currentTab = tab.id"
        class="tab-btn"
        :class="{ active: currentTab === tab.id }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">

      <!-- Budget Scenarios Tab -->
      <div v-if="currentTab === 'scenarios'" class="scenarios-tab">
        <div class="grid grid-cols-3 gap-lg mb-xl">
          <div v-for="scenario in scenarios" :key="scenario.id" class="scenario-card card">
            <div class="card-header">
              <h3 class="card-title">{{ scenario.name }}</h3>
              <div class="scenario-meta text-sm text-secondary">
                Floor: {{ formatCurrency(scenario.wageFloor) }} • {{ scenario.payPercentage }}%
              </div>
            </div>
            <div class="card-body">
              <div class="budget-summary mb-md">
                <div class="text-3xl font-bold text-primary mb-xs">
                  {{ formatCurrency(calculateScenarioTotal(scenario)) }}
                </div>
                <div class="text-sm text-secondary">Total Budget</div>
              </div>

              <!-- Collaborator Breakdown -->
              <div class="collaborator-breakdown">
                <div v-for="member in projectMembers" :key="member.id" class="flex justify-between text-sm py-xs border-b border-light">
                  <span>{{ member.displayName }}</span>
                  <span>{{ formatCurrency(calculateMemberPay(member, scenario)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Income Sources Tab -->
      <div v-if="currentTab === 'income'" class="income-tab">
        <div class="card p-lg">
          <div class="flex justify-between items-center mb-lg">
            <h3 class="card-title">Income Sources</h3>
            <button @click="addIncomeSource" class="btn btn-sm btn-secondary">+ Add Source</button>
          </div>

          <div class="income-list flex flex-col gap-md">
            <div v-for="(source, index) in project.incomeSources" :key="source.id" class="income-item flex gap-md items-center">
              <input v-model="source.name" class="form-input" placeholder="Grant / Funder Name" />
              <input v-model.number="source.amount" type="number" class="form-input w-32" placeholder="Amount" />
              <select v-model="source.status" class="form-select w-40">
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="projected">Projected</option>
              </select>
              <button @click="removeIncomeSource(index)" class="btn btn-sm btn-text text-error">×</button>
            </div>
             <div v-if="!project.incomeSources?.length" class="text-center text-muted py-md">
              No income sources added yet.
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
      <div class="modal-card card">
        <div class="modal-header mb-lg">
          <h2 class="modal-title">Invite Collaborator</h2>
          <button @click="showInviteModal = false" class="close-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="inviteEmail"
              type="email"
              class="form-input"
              placeholder="colleague@example.com"
              @keyup.enter="handleInvite"
            />
          </div>

          <div v-if="inviteError" class="alert alert-error mb-md">
            {{ inviteError }}
          </div>

          <div v-if="inviteSuccess" class="alert alert-success mb-md">
            {{ inviteSuccess }}
          </div>

          <div class="flex justify-end gap-sm">
            <button @click="showInviteModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleInvite" class="btn btn-primary" :disabled="inviting">
              {{ inviting ? 'Inviting...' : 'Send Invite' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
  <div v-else class="loading-view container text-center p-xl">
    Loading project...
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '../stores/projects';
import { useCollaboratorsStore } from '../stores/collaborators';
import { formatCurrency } from '../utils/calculations';

const route = useRoute();
const projectsStore = useProjectsStore();
const collaboratorsStore = useCollaboratorsStore();

const project = ref(null);
const currentTab = ref('scenarios');
const showInviteModal = ref(false);
const inviteEmail = ref('');
const inviting = ref(false);
const inviteError = ref(null);
const inviteSuccess = ref(null);
const projectMembers = ref([]);

const tabs = [
  { id: 'scenarios', label: 'Budget Scenarios' },
  { id: 'income', label: 'Income Sources' },
  { id: 'phases', label: 'Phases & Schedule' }
];

// Computed Scenarios (ensure we have defaults)
const scenarios = computed(() => {
  if (!project.value?.scenarios) return [];
  return Object.values(project.value.scenarios);
});

onMounted(async () => {
  await loadProject();
});

async function loadProject() {
  await projectsStore.fetchProjects();
  project.value = projectsStore.getById(route.params.id);

  if (project.value) {
    await loadMembers();
  }
}

async function loadMembers() {
  if (!project.value.members) return;

  const memberIds = Object.keys(project.value.members);
  await collaboratorsStore.fetchUsersByIds(memberIds);

  projectMembers.value = memberIds.map(id => {
    const user = collaboratorsStore.getById(id);
    return user ? { ...user, role: project.value.members[id].role } : null;
  }).filter(Boolean);
}

async function handleInvite() {
  if (!inviteEmail.value) return;

  inviting.value = true;
  inviteError.value = null;
  inviteSuccess.value = null;

  try {
    const user = await collaboratorsStore.findUserByEmail(inviteEmail.value);

    if (!user) {
      inviteError.value = "User not found. They must sign up first.";
    } else {
      // Add to project members
      const updatedMembers = {
        ...project.value.members,
        [user.id]: { role: 'collaborator' }
      };

      await projectsStore.updateProject(project.value.id, { members: updatedMembers });

      inviteSuccess.value = `Added ${user.displayName} to the project!`;
      inviteEmail.value = '';

      // Reload members
      await loadMembers();

      setTimeout(() => {
        showInviteModal.value = false;
        inviteSuccess.value = null;
      }, 1500);
    }
  } catch (error) {
    inviteError.value = error.message;
  } finally {
    inviting.value = false;
  }
}

function calculateScenarioTotal(scenario) {
  // Simplified calculation for display
  let total = 0;
  projectMembers.value.forEach(member => {
    total += calculateMemberPay(member, scenario);
  });
  return total;
}

function calculateMemberPay(member, scenario) {
  // Get member's goal rate from their profile (or default)
  const goalRate = member.financialData?.goalHourly || 0;

  // Apply scenario logic (wage floor, percentage)
  const effectiveRate = Math.max(
    scenario.wageFloor,
    goalRate * (scenario.payPercentage / 100)
  );

  // Multiply by assigned hours (defaulting to 100 for MVP display)
  const hours = 100;

  return effectiveRate * hours;
}

async function saveProject() {
  if (!project.value) return;
  await projectsStore.updateProject(project.value.id, {
    incomeSources: project.value.incomeSources
  });
}

function addIncomeSource() {
  if (!project.value.incomeSources) project.value.incomeSources = [];
  project.value.incomeSources.push({
    id: Date.now().toString(),
    name: '',
    amount: 0,
    status: 'projected'
  });
}

function removeIncomeSource(index) {
  project.value.incomeSources.splice(index, 1);
}

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active': return 'badge-success';
    case 'planning': return 'badge-info';
    case 'completed': return 'badge-primary';
    default: return 'badge-secondary';
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString();
}


</script>

<style scoped>
.project-detail-view {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.page-title {
  margin-bottom: var(--space-xs);
}

.tabs {
  display: flex;
  gap: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: var(--color-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: var(--color-text-secondary);
}

.alert-success {
  background: var(--color-success);
  color: white;
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.alert-error {
  background: var(--color-error);
  color: white;
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.w-32 { width: 8rem; }
.w-40 { width: 10rem; }
.border-b { border-bottom-width: 1px; }
.border-light { border-color: var(--color-border-light); }
.py-xs { padding-top: var(--space-xs); padding-bottom: var(--space-xs); }
</style>
