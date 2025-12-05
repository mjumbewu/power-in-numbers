<template>
  <div class="dashboard fade-in">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="text-secondary">Overview of your collaborative projects and financial equity</p>
    </div>

    <div class="metrics-grid grid grid-cols-4">
      <div class="metric-card card">
        <div class="metric-icon" style="background: var(--gradient-primary)">👥</div>
        <div class="metric-content">
          <div class="metric-value">{{ collaboratorsStore.collaborators.length }}</div>
          <div class="metric-label">Collaborators</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon" style="background: var(--gradient-accent)">📊</div>
        <div class="metric-content">
          <div class="metric-value">{{ projectsStore.activeProjects.length }}</div>
          <div class="metric-label">Active Projects</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon" style="background: linear-gradient(135deg, hsl(290, 90%, 65%), hsl(40, 95%, 60%))">💰</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatCurrency(totalBudget) }}</div>
          <div class="metric-label">Total Budget</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon" style="background: linear-gradient(135deg, hsl(145, 70%, 50%), hsl(170, 75%, 55%))">⚖️</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatNumber(totalEquity) }}</div>
          <div class="metric-label">Equity Shares</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid grid grid-cols-2">
      <div class="card">
        <div class="card-header">
          <h3>Recent Projects</h3>
          <RouterLink to="/projects" class="btn btn-sm btn-secondary">View All</RouterLink>
        </div>
        <div class="card-body">
          <div v-if="projectsStore.projects.length === 0" class="empty-state">
            <p class="text-muted">No projects yet</p>
          </div>
          <div v-else class="project-list">
            <div v-for="project in recentProjects" :key="project.id" class="project-item">
              <div class="project-info">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-meta text-muted">
                  {{ project.phases?.length || 0 }} phases • {{ project.incomeSources?.length || 0 }} income sources
                </div>
              </div>
              <span class="badge" :class="`badge-${getStatusColor(project.status)}`">
                {{ project.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Collaborators</h3>
          <RouterLink to="/collaborators" class="btn btn-sm btn-secondary">View All</RouterLink>
        </div>
        <div class="card-body">
          <div v-if="collaboratorsStore.collaborators.length === 0" class="empty-state">
            <p class="text-muted">No collaborators yet</p>
          </div>
          <div v-else class="collaborator-list">
            <div v-for="collaborator in recentCollaborators" :key="collaborator.id" class="collaborator-item">
              <div class="collaborator-avatar">
                {{ getInitials(collaborator.name) }}
              </div>
              <div class="collaborator-info">
                <div class="collaborator-name">{{ collaborator.name }}</div>
                <div class="collaborator-role text-muted">{{ collaborator.role }}</div>
              </div>
              <div class="collaborator-equity text-secondary">
                {{ formatNumber(getCollaboratorEquity(collaborator.id)) }} shares
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useCollaboratorsStore } from '../stores/collaborators.js';
import { useProjectsStore } from '../stores/projects.js';
import { useScenariosStore } from '../stores/scenarios.js';
import { useEquityStore } from '../stores/equity.js';
import { formatCurrency, formatNumber } from '../utils/calculations.js';

const collaboratorsStore = useCollaboratorsStore();
const projectsStore = useProjectsStore();
const scenariosStore = useScenariosStore();
const equityStore = useEquityStore();

const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 3);
});

const recentCollaborators = computed(() => {
  return collaboratorsStore.collaborators.slice(0, 5);
});

const totalBudget = computed(() => {
  let total = 0;
  scenariosStore.scenarios.forEach(scenario => {
    const budget = scenariosStore.getScenarioBudget(scenario.id);
    total += budget.total;
  });
  return total;
});

const totalEquity = computed(() => {
  return equityStore.equityLogs.reduce((sum, log) => sum + (log.sharesEarned || 0), 0);
});

function getCollaboratorEquity(collaboratorId) {
  return equityStore.getTotalSharesForCollaborator(collaboratorId);
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusColor(status) {
  const colors = {
    active: 'success',
    planning: 'info',
    completed: 'primary',
    paused: 'warning'
  };
  return colors[status] || 'primary';
}
</script>

<style scoped>
.dashboard-header {
  margin-bottom: var(--space-2xl);
}

.dashboard-header h1 {
  margin-bottom: var(--space-sm);
}

.metrics-grid {
  margin-bottom: var(--space-2xl);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  transition: transform var(--transition-base);
}

.metric-card:hover {
  transform: translateY(-4px);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-2xl);
  box-shadow: var(--shadow-md);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-grid {
  gap: var(--space-xl);
}

.project-list,
.collaborator-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;
}

.project-item:hover {
  background: var(--color-bg-secondary);
  transform: translateX(4px);
}

.project-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.project-meta {
  font-size: var(--font-size-sm);
}

.collaborator-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.collaborator-item:hover {
  background: var(--color-bg-secondary);
  transform: translateX(4px);
}

.collaborator-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.collaborator-info {
  flex: 1;
}

.collaborator-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.collaborator-role {
  font-size: var(--font-size-sm);
}

.collaborator-equity {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
