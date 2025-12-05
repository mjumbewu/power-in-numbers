<template>
  <div class="equity-view fade-in">
    <div class="view-header">
      <div>
        <h1>Equity & Producerial Shares</h1>
        <p class="text-secondary">Track equity earned when collaborators are paid below their goal rates</p>
      </div>
    </div>

    <div class="metrics-grid grid grid-cols-3 mb-xl">
      <div class="metric-card card">
        <div class="metric-icon" style="background: var(--gradient-primary)">⚖️</div>
        <div class="metric-content">
          <div class="metric-value">{{ formatNumber(totalShares) }}</div>
          <div class="metric-label">Total Shares</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon" style="background: var(--gradient-accent)">👥</div>
        <div class="metric-content">
          <div class="metric-value">{{ collaboratorsWithEquity.length }}</div>
          <div class="metric-label">Collaborators with Equity</div>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon" style="background: linear-gradient(135deg, hsl(145, 70%, 50%), hsl(170, 75%, 55%))">📊</div>
        <div class="metric-content">
          <div class="metric-value">{{ projectsWithEquity.length }}</div>
          <div class="metric-label">Projects with Equity</div>
        </div>
      </div>
    </div>

    <div class="info-card card mb-xl">
      <h3>What are Producerial Shares?</h3>
      <p class="text-secondary">
        When a collaborator is paid below their Goal Rate, the difference is converted into "Producerial Shares" or "equity points."
        This tracks the investment each collaborator makes in the project when accepting lower wages. Think of it as deferred compensation
        that acknowledges the true value of their contribution.
      </p>
      <div class="example mt-md p-md" style="background: var(--color-bg-tertiary); border-radius: var(--radius-md);">
        <strong>Example:</strong> If Kristal's goal rate is $117/hr, but she agrees to work for $82/hr on a 100-hour project,
        she earns <strong>3,500 producerial shares</strong> ($117 - $82 = $35 × 100 hours).
      </div>
    </div>

    <div v-if="equityStore.equityLogs.length === 0" class="empty-state card">
      <div class="empty-icon">⚖️</div>
      <h3>No Equity Tracked Yet</h3>
      <p class="text-secondary">
        Equity shares will be automatically tracked when you create budget scenarios where collaborators
        are paid below their goal rates.
      </p>
    </div>

    <div v-else>
      <h2 class="mb-lg">Equity by Collaborator</h2>
      <div class="grid grid-cols-2 mb-2xl">
        <div v-for="collab in collaboratorsWithEquity" :key="collab.id" class="equity-card card">
          <div class="equity-header">
            <div class="collab-avatar-large">
              {{ getInitials(collab.name) }}
            </div>
            <div class="collab-info">
              <h3>{{ collab.name }}</h3>
              <p class="text-muted">{{ collab.role }}</p>
            </div>
          </div>

          <div class="equity-total">
            <div class="equity-label">Total Producerial Shares</div>
            <div class="equity-value">{{ formatNumber(getCollaboratorTotalShares(collab.id)) }}</div>
          </div>

          <div class="equity-logs mt-md">
            <h4>Share Breakdown</h4>
            <div v-for="log in getCollaboratorLogs(collab.id)" :key="log.id" class="equity-log-item">
              <div class="log-project">
                <strong>{{ getProjectName(log.projectId) }}</strong>
                <span class="badge badge-primary">{{ getScenarioName(log.scenarioId) }}</span>
              </div>
              <div class="log-details">
                <div class="log-row">
                  <span class="text-muted">Goal Rate:</span>
                  <span>{{ formatCurrency(log.goalRate) }}/hr</span>
                </div>
                <div class="log-row">
                  <span class="text-muted">Actual Rate:</span>
                  <span>{{ formatCurrency(log.actualRate) }}/hr</span>
                </div>
                <div class="log-row">
                  <span class="text-muted">Hours Worked:</span>
                  <span>{{ log.hoursWorked }} hrs</span>
                </div>
                <div class="log-row highlight">
                  <strong>Shares Earned:</strong>
                  <strong class="shares-value">{{ formatNumber(log.sharesEarned) }}</strong>
                </div>
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
import { useCollaboratorsStore } from '../stores/collaborators.js';
import { useProjectsStore } from '../stores/projects.js';
import { useScenariosStore } from '../stores/scenarios.js';
import { useEquityStore } from '../stores/equity.js';
import { formatCurrency, formatNumber } from '../utils/calculations.js';

const collaboratorsStore = useCollaboratorsStore();
const projectsStore = useProjectsStore();
const scenariosStore = useScenariosStore();
const equityStore = useEquityStore();

const totalShares = computed(() => {
  return equityStore.equityLogs.reduce((sum, log) => sum + (log.sharesEarned || 0), 0);
});

const collaboratorsWithEquity = computed(() => {
  const collaboratorIds = [...new Set(equityStore.equityLogs.map(log => log.collaboratorId))];
  return collaboratorIds
    .map(id => collaboratorsStore.getById(id))
    .filter(Boolean);
});

const projectsWithEquity = computed(() => {
  const projectIds = [...new Set(equityStore.equityLogs.map(log => log.projectId))];
  return projectIds
    .map(id => projectsStore.getById(id))
    .filter(Boolean);
});

function getCollaboratorTotalShares(collaboratorId) {
  return equityStore.getTotalSharesForCollaborator(collaboratorId);
}

function getCollaboratorLogs(collaboratorId) {
  return equityStore.getByCollaboratorId(collaboratorId);
}

function getProjectName(projectId) {
  const project = projectsStore.getById(projectId);
  return project?.name || 'Unknown Project';
}

function getScenarioName(scenarioId) {
  const scenario = scenariosStore.getById(scenarioId);
  return scenario?.name || 'Unknown Scenario';
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<style scoped>
.view-header {
  margin-bottom: var(--space-2xl);
}

.view-header h1 {
  margin-bottom: var(--space-sm);
}

.metrics-grid {
  gap: var(--space-lg);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
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

.info-card {
  background: var(--gradient-card);
}

.info-card h3 {
  margin-bottom: var(--space-md);
}

.equity-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.equity-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.collab-avatar-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.collab-info h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.collab-info p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.equity-total {
  padding: var(--space-lg);
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  text-align: center;
}

.equity-label {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.equity-value {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: white;
}

.equity-logs h4 {
  margin-bottom: var(--space-md);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.equity-log-item {
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.log-project {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.log-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.log-row.highlight {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.shares-value {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
