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
      redirect: '/studio'
    },
    {
      path: '/studio',
      name: 'studio',
      component: () => import('../views/Studio.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(authGuard)

export default router
