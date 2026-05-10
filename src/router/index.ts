import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'vehicle-catalog',
      component: () => import('@/pages/CatalogPage.vue'),
    },
    {
      path: '/catalog',
      redirect: { name: 'vehicle-catalog' },
    },
    {
      path: '/catalog/:vehicleId',
      name: 'vehicle-detail',
      component: () => import('@/pages/VehicleDetailPage.vue'),
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
