<template>
  <div class="financial-profiles-view fade-in">
    <div class="view-header">
      <div>
        <h1>Financial Profiles</h1>
        <p class="text-secondary">Calculate personalized rates based on real financial needs</p>
      </div>
      <button @click="showAddForm = true" class="btn btn-primary">
        + Create Profile
      </button>
    </div>

    <div v-if="showAddForm" class="modal-overlay" @click.self="showAddForm = false">
      <div class="modal-content card">
        <div class="card-header">
          <h3>Create Financial Profile</h3>
          <button @click="showAddForm = false" class="btn btn-sm btn-secondary">Cancel</button>
        </div>
        <form @submit.prevent="handleCreateProfile" class="card-body">
          <div class="form-group">
            <label class="form-label">Collaborator *</label>
            <select v-model="newProfile.collaboratorId" class="form-select" required>
              <option value="">Select collaborator...</option>
              <option v-for="collab in collaboratorsStore.sortedByName" :key="collab.id" :value="collab.id">
                {{ collab.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Year</label>
            <input v-model.number="newProfile.year" type="number" class="form-input" />
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Target Hours/Day</label>
              <input v-model.number="newProfile.targetHoursPerDay" type="number" class="form-input" placeholder="7" />
            </div>
            <div class="form-group">
              <label class="form-label">Target Days/Week</label>
              <input v-model.number="newProfile.targetDaysPerWeek" type="number" class="form-input" placeholder="5" />
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Target Weeks/Year</label>
              <input v-model.number="newProfile.targetWeeksPerYear" type="number" class="form-input" placeholder="43" />
            </div>
            <div class="form-group">
              <label class="form-label">Non-Billable %</label>
              <input v-model.number="newProfile.nonBillablePercentage" type="number" class="form-input" placeholder="20" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Actual Current Annual Net Income</label>
            <input v-model.number="newProfile.actualCurrentAnnualNetIncome" type="number" class="form-input" placeholder="45000" />
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Acceptable Hourly Rate</label>
            <input v-model.number="newProfile.minimumAcceptableRate" type="number" class="form-input" placeholder="100" />
          </div>

          <h4 class="mt-lg mb-md">Monthly Expenses</h4>

          <div v-for="(expense, index) in newProfile.expenses" :key="index" class="expense-row">
            <input v-model="expense.category" type="text" class="form-input" placeholder="Category (e.g., Rent)" />
            <input v-model.number="expense.amount" type="number" class="form-input" placeholder="Amount" />
            <button type="button" @click="newProfile.expenses.splice(index, 1)" class="btn btn-sm btn-secondary">×</button>
          </div>

          <button type="button" @click="addExpenseRow" class="btn btn-sm btn-secondary mb-lg">
            + Add Expense
          </button>

          <button type="submit" class="btn btn-accent">Create Profile</button>
        </form>
      </div>
    </div>

    <div v-if="financialProfilesStore.profiles.length === 0" class="empty-state card">
      <div class="empty-icon">💰</div>
      <h3>No Financial Profiles Yet</h3>
      <p class="text-secondary">Create financial profiles to calculate fair rates for your collaborators</p>
      <button @click="showAddForm = true" class="btn btn-primary">Create First Profile</button>
    </div>

    <div v-else class="grid grid-cols-2">
      <div v-for="profile in financialProfilesStore.profiles" :key="profile.id" class="profile-card card">
        <div class="card-header">
          <h3>{{ getCollaboratorName(profile.collaboratorId) }}</h3>
          <span class="badge badge-info">{{ profile.year }}</span>
        </div>

        <div class="card-body">
          <div class="rates-grid">
            <div class="rate-box goal">
              <div class="rate-label">Goal Rate</div>
              <div class="rate-value">{{ formatCurrency(getRates(profile.id)?.goalHourly || 0) }}/hr</div>
              <div class="rate-daily">{{ formatCurrency(getRates(profile.id)?.goalDaily || 0) }}/day</div>
            </div>

            <div class="rate-box now">
              <div class="rate-label">Now Rate</div>
              <div class="rate-value">{{ formatCurrency(getRates(profile.id)?.nowHourly || 0) }}/hr</div>
              <div class="rate-daily">{{ formatCurrency(getRates(profile.id)?.nowDaily || 0) }}/day</div>
            </div>

            <div class="rate-box minimum">
              <div class="rate-label">Minimum Rate</div>
              <div class="rate-value">{{ formatCurrency(getRates(profile.id)?.minimumHourly || 0) }}/hr</div>
              <div class="rate-daily">{{ formatCurrency(getRates(profile.id)?.minimumDaily || 0) }}/day</div>
            </div>
          </div>

          <div class="profile-summary mt-lg">
            <div class="summary-row">
              <span>Annual Expenses:</span>
              <span>{{ formatCurrency(getRates(profile.id)?.annualExpenses || 0) }}</span>
            </div>
            <div class="summary-row">
              <span>Billable Hours:</span>
              <span>{{ getRates(profile.id)?.billableHours || 0 }} hrs/yr</span>
            </div>
            <div class="summary-row">
              <span>Actual Net Income:</span>
              <span>{{ formatCurrency(getRates(profile.id)?.actualCurrentAnnualNetIncome || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCollaboratorsStore } from '../stores/collaborators.js';
import { useFinancialProfilesStore } from '../stores/financialProfiles.js';
import { formatCurrency } from '../utils/calculations.js';
import { generateId } from '../utils/calculations.js';

const collaboratorsStore = useCollaboratorsStore();
const financialProfilesStore = useFinancialProfilesStore();

const showAddForm = ref(false);
const newProfile = ref({
  collaboratorId: '',
  year: new Date().getFullYear(),
  targetHoursPerDay: 7,
  targetDaysPerWeek: 5,
  targetWeeksPerYear: 43,
  nonBillablePercentage: 20,
  actualCurrentAnnualNetIncome: 45000,
  minimumAcceptableRate: 100,
  expenses: [
    { category: 'Rent/Mortgage', amount: 2000 }
  ]
});

function addExpenseRow() {
  newProfile.value.expenses.push({ category: '', amount: 0 });
}

function handleCreateProfile() {
  const profileData = {
    ...newProfile.value,
    expenses: newProfile.value.expenses
      .filter(e => e.category && e.amount > 0)
      .map(e => ({ id: generateId(), ...e }))
  };

  financialProfilesStore.addProfile(profileData);

  newProfile.value = {
    collaboratorId: '',
    year: new Date().getFullYear(),
    targetHoursPerDay: 7,
    targetDaysPerWeek: 5,
    targetWeeksPerYear: 43,
    nonBillablePercentage: 20,
    actualCurrentAnnualNetIncome: 45000,
    minimumAcceptableRate: 100,
    expenses: [{ category: 'Rent/Mortgage', amount: 2000 }]
  };

  showAddForm.value = false;
}

function getCollaboratorName(collaboratorId) {
  const collab = collaboratorsStore.getById(collaboratorId);
  return collab?.name || 'Unknown';
}

function getRates(profileId) {
  return financialProfilesStore.getCalculatedRates(profileId);
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

.expense-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.profile-card {
  min-height: 400px;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.rate-box {
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  text-align: center;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}

.rate-box.goal {
  border-color: var(--color-primary);
  background: linear-gradient(145deg, var(--color-bg-tertiary), hsl(250, 95%, 12%));
}

.rate-box.now {
  border-color: var(--color-accent);
  background: linear-gradient(145deg, var(--color-bg-tertiary), hsl(170, 75%, 12%));
}

.rate-box.minimum {
  border-color: var(--color-warning);
  background: linear-gradient(145deg, var(--color-bg-tertiary), hsl(40, 95%, 12%));
}

.rate-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.rate-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.rate-daily {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.profile-summary {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  font-size: var(--font-size-sm);
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

@media (max-width: 768px) {
  .rates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
