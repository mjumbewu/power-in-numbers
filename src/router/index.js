import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
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
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} - Power in Numbers` || 'Power in Numbers';
    next();
});

export default router;
