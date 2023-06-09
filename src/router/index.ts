import { createRouter, createWebHashHistory } from 'vue-router'

const Home = () => import('@/views/home/Home.vue')
const City = () => import('@/views/city/City.vue')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/city',
      name: 'city',
      component: City,
    },
  ],
})

export default router
