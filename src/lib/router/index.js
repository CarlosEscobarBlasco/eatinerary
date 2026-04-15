import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: () => import('../../views/calendar/CalendarView.vue')
  },
  {
    path: '/dishes',
    name: 'Dishes',
    component: () => import('../../views/dishes/DishesView.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../../views/home/HomeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
