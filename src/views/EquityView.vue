<template>
  <div class="equity-view container">
    <div class="header-section mb-xl">
      <h1 class="page-title">Equity & Producerial Shares</h1>
      <p class="text-secondary">Track equity earned when collaborators are paid below their goal rates</p>
    </div>

    <div class="metrics-grid grid grid-cols-3 gap-lg mb-xl">
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

    <div class="info-card card mb-xl p-lg bg-tertiary">
      <h3 class="mb-md">What are Producerial Shares?</h3>
      <p class="text-secondary mb-md">
        When a collaborator is paid below their Goal Rate, the difference is converted into "Producerial Shares" or "equity points."
        This tracks the investment each collaborator makes in the project when accepting lower wages.
      </p>
      <div class="example p-md bg-white rounded border border-light">
        <strong>Example:</strong> If Kristal's goal rate is $117/hr, but she agrees to work for $82/hr on a 100-hour project,
        she earns <strong>3,500 producerial shares</strong> ($117 - $82 = $35 × 100 hours).
      </div>
    </div>

    <div v-if="loading" class="text-center p-xl">
      Loading equity data...
    </div>

    <div v-else-if="equityLogs.length === 0" class="empty-state card p-2xl text-center">
      <div class="text-4xl mb-lg">⚖️</div>
      <h3 class="mb-sm">No Equity Tracked Yet</h3>
      <p class="text-secondary">
        Equity shares will be automatically tracked when you create budget scenarios where collaborators
        are paid below their goal rates.
      </p>
    </div>

    <div v-else>
      <h2 class="mb-lg section-title">Equity by Collaborator</h2>
      <div class="grid grid-cols-2 gap-xl mb-2xl">
        <div v-for="collab in collaboratorsWithEquity" :key="collab.id" class="equity-card card">
          <div class="card-header flex items-center gap-md">
            <div class="collab-avatar-large">{{ getInitials(collab.name) }}</div>
            <div class="collab-info">
              <h3 class="text-lg font-bold">{{ collab.name }}</h3>
              <p class="text-sm text-secondary">{{ collab.role }}</p>
            </div>
          </div>

          <div class="card-body">
            <div class="equity-total p-lg rounded-lg text-center mb-lg" style="background: var(--gradient-primary)">
              <div class="text-sm text-white opacity-90 uppercase tracking-wide mb-xs">Total Producerial Shares</div>
              <div class="text-4xl font-bold text-white">{{ formatNumber(collab.totalShares) }}</div>
            </div>

            <div class="equity-logs">
              <h4 class="text-sm font-bold text-secondary uppercase mb-md">Share Breakdown</h4>
              <div v-for="log in collab.logs" :key="log.id" class="equity-log-item p-md bg-tertiary rounded mb-sm">
                <div class="flex justify-between items-center mb-sm pb-sm border-b border-light">
                  <strong class="text-primary">{{ log.projectName }}</strong>
                  <span class="badge badge-sm badge-info">{{ log.scenarioName }}</span>
                </div>
                <div class="log-details text-sm">
                  <div class="flex justify-between mb-xs">
                    <span class="text-secondary">Goal Rate:</span>
                    <span>{{ formatCurrency(log.goalRate) }}/hr</span>
                  </div>
                  <div class="flex justify-between mb-xs">
                    <span class="text-secondary">Actual Rate:</span>
                    <span>{{ formatCurrency(log.actualRate) }}/hr</span>
                  </div>
                  <div class="flex justify-between mb-xs">
                    <span class="text-secondary">Hours:</span>
                    <span>{{ log.hours }} hrs</span>
                  </div>
                  <div class="flex justify-between mt-sm pt-sm border-t border-light">
                    <strong>Shares Earned:</strong>
                    <strong class="text-primary">{{ formatNumber(log.shares) }}</strong>
                  </div>
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
import { ref, computed, onMounted } from 'vue';
import { useProjectsStore } from '../stores/projects';
import { useCollaboratorsStore } from '../stores/collaborators';
import { formatCurrency, formatNumber } from '../utils/calculations';

const projectsStore = useProjectsStore();
const collaboratorsStore = useCollaboratorsStore();
const loading = ref(true);

onMounted(async () => {
  await projectsStore.fetchProjects();
  // We need to fetch collaborators for all projects to get names/rates
  // For MVP, we might need to iterate and fetch.
  // Ideally, projectsStore or a view helper does this.
  // Let's just fetch all known members from projects.
  const allMemberIds = new Set();
  projectsStore.projects.forEach(p => {
    if (p.members) {
      Object.keys(p.members).forEach(uid => allMemberIds.add(uid));
    }
  });
  await collaboratorsStore.fetchUsersByIds([...allMemberIds]);
  loading.value = false;
});

// Computed Equity Logs
const equityLogs = computed(() => {
  const logs = [];

  projectsStore.projects.forEach(project => {
    if (!project.scenarios) return;

    Object.values(project.scenarios).forEach(scenario => {
      // For each member in the project
      if (!project.members) return;

      Object.keys(project.members).forEach(uid => {
        const member = collaboratorsStore.getById(uid);
        if (!member) return; // Skip if not found (or loading)

        // Calculate equity for this member in this scenario
        // Logic: (GoalRate - ActualRate) * Hours
        // ActualRate = Max(WageFloor, GoalRate * Percentage)

        const goalRate = member.financialData?.goalHourly || 0;
        const wageFloor = scenario.wageFloor || 0;
        const payPercentage = scenario.payPercentage || 0;

        const actualRate = Math.max(wageFloor, goalRate * (payPercentage / 100));

        // If actual rate >= goal rate, no equity
        if (actualRate >= goalRate) return;

        const diff = goalRate - actualRate;
        const hours = 100; // Placeholder for MVP, should be per-phase/member
        const shares = diff * hours;

        if (shares > 0) {
          logs.push({
            id: `${project.id}-${scenario.id}-${uid}`,
            collaboratorId: uid,
            collaboratorName: member.displayName || 'Unknown',
            projectId: project.id,
            projectName: project.name,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            goalRate,
            actualRate,
            hours,
            shares
          });
        }
      });
    });
  });

  return logs;
});

const totalShares = computed(() => {
  return equityLogs.value.reduce((sum, log) => sum + log.shares, 0);
});

const collaboratorsWithEquity = computed(() => {
  const map = new Map();

  equityLogs.value.forEach(log => {
    if (!map.has(log.collaboratorId)) {
      map.set(log.collaboratorId, {
        id: log.collaboratorId,
        name: log.collaboratorName,
        role: 'Collaborator', // Placeholder
        totalShares: 0,
        logs: []
      });
    }
    const entry = map.get(log.collaboratorId);
    entry.totalShares += log.shares;
    entry.logs.push(log);
  });

  return Array.from(map.values());
});

const projectsWithEquity = computed(() => {
  const projectIds = new Set(equityLogs.value.map(log => log.projectId));
  return Array.from(projectIds);
});

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
}
</script>

<style scoped>
.equity-view {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.page-title {
  margin-bottom: var(--space-xs);
}

.metric-card {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.metric-value {
  font-size: var(--font-size-3xl);
  font-weight: bold;
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.collab-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.bg-tertiary { background-color: var(--color-bg-tertiary); }
.border-light { border-color: var(--color-border-light); }
</style>

