<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <span>#</span>
          </div>
          <span class="logo-text">Power in Numbers</span>
        </router-link>
      </div>

      <nav v-if="authStore.isAuthenticated" class="main-nav">
        <router-link to="/" class="nav-link" active-class="active">Dashboard</router-link>
        <router-link to="/projects" class="nav-link" active-class="active">Projects</router-link>
        <router-link to="/collaborators" class="nav-link" active-class="active">Collaborators</router-link>
        <router-link to="/financial-profiles" class="nav-link" active-class="active">Financial Profiles</router-link>
        <router-link to="/equity" class="nav-link" active-class="active">Equity</router-link>
      </nav>

      <div v-if="authStore.isAuthenticated" class="user-section">
        <span class="user-name">{{ authStore.user?.displayName }}</span>
        <button @click="handleLogout" class="btn btn-sm btn-secondary">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-md) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-text {
  font-family: var(--font-family-headings);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.main-nav {
  display: flex;
  gap: var(--space-lg);
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
  position: relative;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 2px;
  background: var(--gradient-primary);
  transition: transform var(--transition-base);
}

.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

.nav-link.active {
  color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.nav-link.active::after {
  transform: translateX(-50%) scaleX(1);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--space-md);
  }

  .nav-menu {
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .nav-link {
    white-space: nowrap;
    font-size: var(--font-size-sm);
    padding: var(--space-xs) var(--space-sm);
  }
}
</style>
