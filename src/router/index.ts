import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('../views/Generate.vue')
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: () => import('../views/Viewer.vue')
    },
    {
      path: '/print',
      name: 'print',
      component: () => import('../views/Print.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/Library.vue')
    }
  ]
})

export default router
