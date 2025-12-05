<template>
  <div class="dashboard-view container">
    <div class="header-section mb-xl">
      <h1 class="page-title">Dashboard</h1>
      <p class="text-secondary">Welcome back, {{ authStore.user?.displayName }}</p>
    </div>

    <div class="grid grid-cols-2 gap-xl">
      <!-- Section 1: My Financial Health -->
      <div class="section">
        <div class="section-header flex justify-between items-center mb-lg">
          <h2 class="section-title">My Financial Health</h2>
          <router-link to="/financial-profiles" class="btn btn-sm btn-secondary">
            Edit Finances
          </router-link>
        </div>

        <div v-if="userStore.loading" class="loading-state card p-xl text-center">
          Loading financial data...
        </div>

        <div v-else-if="userStore.rates" class="financial-card card">
          <div class="rate-grid grid grid-cols-2 gap-lg">
            <div class="rate-item">
              <div class="rate-label">Goal Rate</div>
              <div class="rate-value text-primary">{{ formatCurrency(userStore.rates.goalHourly) }}/hr</div>
              <div class="rate-sub">Based on expenses & savings</div>
            </div>
            <div class="rate-item">
              <div class="rate-label">Now Rate</div>
              <div class="rate-value text-accent">{{ formatCurrency(userStore.rates.nowHourly) }}/hr</div>
              <div class="rate-sub">Based on current income</div>
            </div>
            <div class="rate-item">
              <div class="rate-label">Billable Hours</div>
              <div class="rate-value">{{ formatNumber(userStore.rates.billableHoursPerYear) }}</div>
              <div class="rate-sub">Target hours / year</div>
            </div>
            <div class="rate-item">
              <div class="rate-label">Annual Expenses</div>
              <div class="rate-value">{{ formatCurrency(userStore.profile?.financialData?.annualExpenses || 0) }}</div>
              <div class="rate-sub">Personal overhead</div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state card p-xl text-center">
          <p class="mb-md">You haven't set up your financial profile yet.</p>
          <div class="flex gap-sm justify-center">
            <router-link to="/financial-profiles" class="btn btn-primary">
              Setup Profile
            </router-link>
            <button @click="handleLoadDemo" class="btn btn-secondary" :disabled="loadingDemo">
              {{ loadingDemo ? 'Loading...' : 'Load Demo Data' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2: My Projects -->
      <div class="section">
        <div class="section-header flex justify-between items-center mb-lg">
          <h2 class="section-title">My Projects</h2>
          <router-link to="/projects" class="btn btn-sm btn-primary">
            + New Project
          </router-link>
        </div>

        <div v-if="projectsStore.loading" class="loading-state card p-xl text-center">
          Loading projects...
        </div>

        <div v-else-if="projectsStore.projects.length > 0" class="projects-list flex flex-col gap-md">
          <div v-for="project in projectsStore.projects" :key="project.id" class="project-card card">
            <div class="card-body flex justify-between items-center">
              <div>
                <h3 class="project-name text-lg font-bold mb-xs">
                  <router-link :to="'/projects/' + project.id">{{ project.name }}</router-link>
                </h3>
                <span class="badge" :class="getStatusClass(project.status)">{{ project.status }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm text-secondary">Owner</div>
                <div class="font-medium">{{ project.ownerId === authStore.user?.uid ? 'Me' : 'Shared' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state card p-xl text-center">
          <p class="mb-md">No projects found.</p>
          <div class="flex gap-sm justify-center">
            <router-link to="/projects" class="btn btn-primary">
              Create Project
            </router-link>
            <button @click="handleLoadDemo" class="btn btn-secondary" :disabled="loadingDemo">
              {{ loadingDemo ? 'Loading...' : 'Load Demo Data' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { useProjectsStore } from '../stores/projects';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { seedDemoData } from '../utils/demoLoader';

const authStore = useAuthStore();
const userStore = useUserStore();
const projectsStore = useProjectsStore();
const loadingDemo = ref(false);

onMounted(async () => {
  await userStore.fetchProfile();
  await projectsStore.fetchProjects();
});

async function handleLoadDemo() {
  if (!confirm("This will overwrite your current profile and add demo projects. Continue?")) return;

  loadingDemo.value = true;
  try {
    await seedDemoData();
    // Refresh data
    await userStore.fetchProfile();
    await projectsStore.fetchProjects();
  } catch (e) {
    console.error(e);
    alert("Failed to load demo data: " + e.message);
  } finally {
    loadingDemo.value = false;
  }
}

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'active': return 'badge-success';
    case 'planning': return 'badge-info';
    case 'completed': return 'badge-primary';
    default: return 'badge-secondary';
  }
}
</script>

<style scoped>
.dashboard-view {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.page-title {
  margin-bottom: var(--space-xs);
}

.section-title {
  font-size: var(--font-size-xl);
  margin: 0;
}

.rate-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.rate-item {
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.rate-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
}

.rate-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.rate-sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.text-primary { color: var(--color-primary); }
.text-accent { color: var(--color-accent); }

.project-card {
  transition: transform var(--transition-fast);
}

.project-card:hover {
  transform: translateX(4px);
  border-color: var(--color-primary-light);
}

.project-name a {
  color: var(--color-text-primary);
  text-decoration: none;
}

.project-name a:hover {
  color: var(--color-primary);
}
</style>
