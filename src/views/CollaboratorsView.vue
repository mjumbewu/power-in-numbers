<template>
  <div class="collaborators-view fade-in">
    <div class="view-header">
      <div>
        <h1>Collaborators</h1>
        <p class="text-secondary">Manage your creative collaborators and their financial information</p>
      </div>
      <button @click="showAddForm = true" class="btn btn-primary">
        + Add Collaborator
      </button>
    </div>

    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal-content card">
        <div class="card-header">
          <h3>Add New Collaborator</h3>
          <button @click="showAddForm = false" class="btn btn-sm btn-secondary">Cancel</button>
        </div>
        <form @submit.prevent="handleAddCollaborator" class="card-body">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input v-model="newCollaborator.name" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="newCollaborator.email" type="email" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <input v-model="newCollaborator.role" type="text" class="form-input" placeholder="e.g., Choreographer, Sound Designer" />
          </div>

          <button type="submit" class="btn btn-accent">Add Collaborator</button>
        </form>
      </div>
    </div>

    <div v-if="collaboratorsStore.collaborators.length === 0" class="empty-state card">
      <div class="empty-icon">👥</div>
      <h3>No Collaborators Yet</h3>
      <p class="text-secondary">Start by adding your first collaborator to the project</p>
      <button @click="showAddForm = true" class="btn btn-primary">Add First Collaborator</button>
    </div>

    <div v-else class="grid grid-cols-3">
      <div v-for="collaborator in collaboratorsStore.sortedByName" :key="collaborator.id" class="collaborator-card card">
        <div class="collaborator-header">
          <div class="collab-avatar-large">
            {{ getInitials(collaborator.name) }}
          </div>
          <div class="collab-info">
            <h3>{{ collaborator.name }}</h3>
            <p class="text-muted">{{ collaborator.role || 'Collaborator' }}</p>
          </div>
        </div>

        <div class="collab-details">
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ collaborator.email || 'Not provided' }}</span>
          </div>


        </div>

        <div class="collab-actions">
          <button @click="deleteCollaborator(collaborator.id)" class="btn btn-sm btn-secondary">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCollaboratorsStore } from '../stores/collaborators.js';

const collaboratorsStore = useCollaboratorsStore();

const showAddForm = ref(false);
const newCollaborator = ref({
  name: '',
  email: '',
  role: ''
});

function handleAddCollaborator() {
  // For now, this just adds to local state/cache.
  // In a real app, this would invite them via email.
  collaboratorsStore.addCollaborator({ ...newCollaborator.value });
  newCollaborator.value = { name: '', email: '', role: '' };
  showAddForm.value = false;
}

function deleteCollaborator(id) {
  if (confirm('Are you sure you want to delete this collaborator?')) {
    collaboratorsStore.deleteCollaborator(id);
  }
}

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2xl);
  gap: var(--space-md);
}

.view-header h1 {
  margin-bottom: var(--space-sm);
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn var(--transition-base);
}

.collaborator-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.collaborator-header {
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

.collab-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail-link {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.detail-link:hover {
  color: var(--color-primary-light);
}

.collab-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
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

@media (max-width: 640px) {
  .view-header {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
