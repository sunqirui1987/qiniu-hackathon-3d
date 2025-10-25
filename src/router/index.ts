import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallback.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('../views/Generate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: () => import('../views/Viewer.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/print',
      name: 'print',
      component: () => import('../views/Print.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/Library.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(authGuard)

export default router
