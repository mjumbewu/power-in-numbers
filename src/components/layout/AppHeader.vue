<template>
  <header class="app-header">
    <div class="header-content container">
      <div class="logo-section">
        <div class="logo">
          <div class="logo-icon">∑</div>
          <span class="logo-text">Power in Numbers</span>
        </div>
      </div>

      <nav class="nav-menu">
        <RouterLink to="/" class="nav-link" :class="{ active: $route.name === 'dashboard' }">
          Dashboard
        </RouterLink>
        <RouterLink to="/collaborators" class="nav-link" :class="{ active: $route.name === 'collaborators' }">
          Collaborators
        </RouterLink>
        <RouterLink to="/projects" class="nav-link" :class="{ active: $route.name === 'projects' || $route.name === 'project-detail' }">
          Projects
        </RouterLink>
        <RouterLink to="/financial-profiles" class="nav-link" :class="{ active: $route.name === 'financial-profiles' }">
          Financial Profiles
        </RouterLink>
        <RouterLink to="/equity" class="nav-link" :class="{ active: $route.name === 'equity' }">
          Equity
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.app-header {
  background: var(--gradient-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: white;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-md);
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav-link {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
}

.nav-link::after {
  content: '';
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
