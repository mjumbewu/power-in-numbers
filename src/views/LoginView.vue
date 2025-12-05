<template>
  <div class="login-view fade-in">
    <div class="auth-card card">
      <div class="text-center mb-xl">
        <h1 class="auth-title">Power in Numbers</h1>
        <p class="text-secondary">Collaborative budgeting for creative projects</p>
      </div>

      <div class="auth-tabs mb-lg">
        <button
          @click="isLogin = true"
          class="tab-btn"
          :class="{ active: isLogin }"
        >
          Login
        </button>
        <button
          @click="isLogin = false"
          class="tab-btn"
          :class="{ active: !isLogin }"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="!isLogin" class="form-group">
          <label class="form-label">Full Name</label>
          <input
            v-model="displayName"
            type="text"
            class="form-input"
            required
            placeholder="Jane Doe"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            required
            placeholder="jane@example.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            required
            placeholder="••••••••"
            minlength="6"
          />
        </div>

        <div v-if="error" class="alert alert-error mb-lg">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
          {{ loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const displayName = ref('');
const loading = ref(false);
const error = ref(null);

async function handleSubmit() {
  loading.value = true;
  error.value = null;

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(email.value, password.value, displayName.value);
    }
    router.push('/');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: var(--color-bg-primary);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
}

.auth-title {
  font-family: var(--font-family-headings);
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.auth-tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
}

.tab-btn {
  flex: 1;
  padding: var(--space-md);
  background: none;
  border: none;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.tab-btn.active {
  color: var(--color-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
}

.w-full {
  width: 100%;
}

.alert-error {
  background: var(--color-error);
  color: white;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
</style>
