<template>
  <div id="app">
    <AppHeader />
    <div class="app-container">
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue';
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  display: flex;
}

.main-content {
  flex: 1;
  padding: var(--space-xl);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-md);
  }
}
</style>
