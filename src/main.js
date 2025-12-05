import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import './style.css'
import './assets/styles/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth before mounting
const authStore = useAuthStore()
authStore.initAuth().then(() => {
    app.mount('#app')
})
