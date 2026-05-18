import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: '默认路径', redirect: '/customer' },
  { path: '/customer', name: '智能销售', component: () => import('@/views/CustomerManagement.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
