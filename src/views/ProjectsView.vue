<template>
  <div class="projects-view fade-in">
    <div class="view-header">
      <div>
        <h1>Projects</h1>
        <p class="text-secondary">Manage collaborative projects with budget scenarios</p>
      </div>
      <button @click="showAddForm = true" class="btn btn-primary">
        + Create Project
      </button>
    </div>

    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal-content card">
        <div class="card-header">
          <h3>Create New Project</h3>
          <button @click="showAddForm = false" class="btn btn-sm btn-secondary">Cancel</button>
        </div>
        <form @submit.prevent="handleCreateProject" class="card-body">
          <div class="form-group">
            <label class="form-label">Project Name *</label>
            <input v-model="newProject.name" type="text" class="form-input" required placeholder="e.g., Echoes of Movement" />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="newProject.description" class="form-textarea" placeholder="Brief project description"></textarea>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input v-model="newProject.startDate" type="date" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">End Date</label>
              <input v-model="newProject.endDate" type="date" class="form-input" />
            </div>
          </div>

          <button type="submit" class="btn btn-accent">Create Project</button>
        </form>
      </div>
    </div>

    <div v-if="projectsStore.projects.length === 0" class="empty-state card">
      <div class="empty-icon">📊</div>
      <h3>No Projects Yet</h3>
      <p class="text-secondary">Create your first collaborative project</p>
      <button @click="showAddForm = true" class="btn btn-primary">Create First Project</button>
    </div>

    <div v-else class="grid grid-cols-2">
      <RouterLink v-for="project in projectsStore.projects" :key="project.id"
                  :to="`/projects/${project.id}`"
                  class="project-card card">
        <div class="card-header">
          <div>
            <h3>{{ project.name }}</h3>
            <span class="badge" :class="`badge-${getStatusColor(project.status)}`">
              {{ project.status }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <p class="project-description">{{ project.description }}</p>

          <div class="project-stats">
            <div class="stat">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <div class="stat-value">{{ project.phases?.length || 0 }}</div>
                <div class="stat-label">Phases</div>
              </div>
            </div>

            <div class="stat">
              <div class="stat-icon">💵</div>
              <div class="stat-content">
                <div class="stat-value">{{ project.incomeSources?.length || 0 }}</div>
                <div class="stat-label">Income Sources</div>
              </div>
            </div>

            <div class="stat">
              <div class="stat-icon">🎭</div>
              <div class="stat-content">
                <div class="stat-value">{{ getScenariosCount(project.id) }}</div>
                <div class="stat-label">Scenarios</div>
              </div>
            </div>
          </div>

          <div class="project-dates">
            <span class="date-label">Duration:</span>
            <span class="date-value">{{ formatDate(project.startDate) }} → {{ formatDate(project.endDate) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useProjectsStore } from '../stores/projects.js';

const projectsStore = useProjectsStore();

const showAddForm = ref(false);
const newProject = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'planning'
});

function handleCreateProject() {
  projectsStore.addProject({ ...newProject.value });
  newProject.value = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning'
  };
  showAddForm.value = false;
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

function getScenariosCount(projectId) {
  const project = projectsStore.getById(projectId);
  return project?.scenarios ? Object.keys(project.scenarios).length : 0;
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-base);
}

.modal-content {
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.project-card {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.project-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  line-height: 1.6;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.stat-icon {
  font-size: var(--font-size-xl);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-dates {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}

.date-label {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.date-value {
  color: var(--color-text-secondary);
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
</style>
