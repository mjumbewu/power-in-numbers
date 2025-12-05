<template>
  <div class="financial-profiles-view container">
    <div class="header-section mb-xl">
      <h1 class="page-title">My Financial Profile</h1>
      <p class="text-secondary">Manage your personal expenses and work preferences to calculate your rates.</p>
    </div>

    <div v-if="userStore.loading" class="loading-state text-center p-xl">
      Loading...
    </div>

    <div v-else class="grid grid-cols-2 gap-xl">

      <!-- Left Column: Inputs -->
      <div class="inputs-section">
        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">Work Schedule</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Target Hours / Day</label>
              <input v-model.number="formData.targetHoursPerDay" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Target Days / Week</label>
              <input v-model.number="formData.targetDaysPerWeek" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Target Weeks / Year</label>
              <input v-model.number="formData.targetWeeksPerYear" type="number" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Non-Billable Work %</label>
              <input v-model.number="formData.nonBillablePercentage" type="number" class="form-input" />
            </div>
          </div>
        </div>

        <div class="card mb-lg">
          <div class="card-header">
            <h3 class="card-title">Annual Expenses</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Total Annual Expenses ($)</label>
              <input v-model.number="formData.annualExpenses" type="number" class="form-input" />
              <p class="text-sm text-secondary mt-sm">Include rent, food, insurance, etc.</p>
            </div>
          </div>
        </div>

        <div class="card mb-lg">
          <div class="card-header">
             <h3 class="card-title">Current Income</h3>
          </div>
          <div class="card-body">
             <div class="form-group">
              <label class="form-label">Actual Current Annual Net Income ($)</label>
              <input v-model.number="formData.actualCurrentAnnualNetIncome" type="number" class="form-input" />
              <p class="text-sm text-secondary mt-sm">Used to calculate your "Now Rate".</p>
            </div>
          </div>
        </div>

        <button @click="saveChanges" class="btn btn-primary btn-lg w-full" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <div v-if="saveMessage" class="text-center mt-md text-success">{{ saveMessage }}</div>
      </div>

      <!-- Right Column: Results -->
      <div class="results-section">
        <div class="card sticky-card">
          <div class="card-header">
            <h3 class="card-title">Your Calculated Rates</h3>
          </div>
          <div class="card-body">
            <div class="rate-display mb-xl">
              <div class="rate-label">Goal Hourly Rate</div>
              <div class="rate-value text-primary">{{ formatCurrency(calculatedRates?.goalHourly) }}/hr</div>
              <div class="rate-desc">
                To cover ${{ formatCurrency(formData.annualExpenses) }} expenses + 20% tax buffer + savings.
              </div>
            </div>

            <div class="rate-display mb-xl">
              <div class="rate-label">Now Hourly Rate</div>
              <div class="rate-value text-accent">{{ formatCurrency(calculatedRates?.nowHourly) }}/hr</div>
              <div class="rate-desc">
                Based on your current actual income.
              </div>
            </div>

            <div class="divider mb-lg"></div>

            <div class="stats-grid grid grid-cols-2 gap-md">
              <div class="stat-item">
                <div class="stat-label">Billable Hours</div>
                <div class="stat-value">{{ formatNumber(calculatedRates?.billableHoursPerYear) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Goal Annual Gross</div>
                <div class="stat-value">{{ formatCurrency(calculatedRates?.goalAnnualGross) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from '../stores/user';
import { formatCurrency, formatNumber, calculatePersonalRates } from '../utils/calculations';

const userStore = useUserStore();
const saving = ref(false);
const saveMessage = ref('');

const formData = ref({
  targetHoursPerDay: 7,
  targetDaysPerWeek: 5,
  targetWeeksPerYear: 43,
  nonBillablePercentage: 20,
  annualExpenses: 0,
  actualCurrentAnnualNetIncome: 0
});

onMounted(async () => {
  await userStore.fetchProfile();
  if (userStore.profile?.financialData) {
    formData.value = { ...formData.value, ...userStore.profile.financialData };
  }
});

// Watch for store updates (e.g. after initial fetch)
watch(() => userStore.profile, (newProfile) => {
  if (newProfile?.financialData) {
    formData.value = { ...formData.value, ...newProfile.financialData };
  }
});

const calculatedRates = computed(() => {
  return calculatePersonalRates({ ...formData.value, expenses: [] });
});

async function saveChanges() {
  saving.value = true;
  saveMessage.value = '';
  try {
    await userStore.updateFinancialData(formData.value);
    saveMessage.value = 'Profile saved successfully!';
    setTimeout(() => saveMessage.value = '', 3000);
  } catch (error) {
    console.error(error);
    saveMessage.value = 'Error saving profile.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.financial-profiles-view {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.page-title {
  margin-bottom: var(--space-xs);
}

.sticky-card {
  position: sticky;
  top: 100px;
}

.rate-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
}

.rate-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-xs);
}

.rate-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.text-primary { color: var(--color-primary); }
.text-accent { color: var(--color-accent); }
.text-success { color: var(--color-success); }

.divider {
  height: 1px;
  background: var(--color-border-light);
  margin: var(--space-lg) 0;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.w-full { width: 100%; }
</style>
