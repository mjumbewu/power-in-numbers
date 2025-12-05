import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { public: true }
        },
        {
            path: '/',
            name: 'dashboard',
            component: DashboardView,
            meta: { title: 'Dashboard' }
        },
        {
            path: '/collaborators',
            name: 'collaborators',
            component: () => import('../views/CollaboratorsView.vue'),
            meta: { title: 'Collaborators' }
        },
        {
            path: '/projects',
            name: 'projects',
            component: () => import('../views/ProjectsView.vue'),
            meta: { title: 'Projects' }
        },
        {
            path: '/projects/:id',
            name: 'project-detail',
            component: () => import('../views/ProjectDetailView.vue'),
            meta: { title: 'Project Details' }
        },
        {
            path: '/financial-profiles',
            name: 'financial-profiles',
            component: () => import('../views/FinancialProfilesView.vue'),
            meta: { title: 'Financial Profiles' }
        },
        {
            path: '/equity',
            name: 'equity',
            component: () => import('../views/EquityView.vue'),
            meta: { title: 'Equity & Shares' }
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Wait for auth to initialize if it hasn't yet
    if (!authStore.authInitialized) {
        await authStore.initAuth()
    }

    const isAuthenticated = authStore.isAuthenticated
    const isPublic = to.meta.public

    if (!isAuthenticated && !isPublic) {
        next({ name: 'login' })
    } else if (isAuthenticated && to.name === 'login') {
        next({ name: 'dashboard' })
    } else {
        // Update page title
        document.title = to.meta.title
            ? `${to.meta.title} | Power in Numbers`
            : 'Power in Numbers'
        next()
    }
})

export default router;
