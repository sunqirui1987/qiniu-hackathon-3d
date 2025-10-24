import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useModelStore } from '../stores/model'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: {
        title: '首页'
      }
    },
    {
      path: '/generate',
      name: 'generate',
      component: () => import('../views/Generate.vue'),
      meta: {
        title: '3D生成',
        requiresGenerate: true
      }
    },
    {
      path: '/viewer',
      name: 'viewer',
      component: () => import('../views/Viewer.vue'),
      meta: {
        title: '3D查看器',
        requiresModel: true
      }
    },
    {
      path: '/print',
      name: 'print',
      component: () => import('../views/Print.vue'),
      meta: {
        title: '打印管理',
        requiresModel: true
      }
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/Library.vue'),
      meta: {
        title: '模型库'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      redirect: '/'
    }
  ]
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 3D生成打印平台`
  }

  const modelStore = useModelStore()

  if (to.meta.requiresModel && !modelStore.currentModel && modelStore.modelHistory.length === 0) {
    console.warn('访问需要模型的页面，但当前没有可用模型')
  }

  return true
})

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  console.log(`导航: ${from.name?.toString() || '/'} -> ${to.name?.toString() || '/'}`)
})

export default router
