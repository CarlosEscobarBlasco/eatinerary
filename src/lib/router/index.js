import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../../views/auth/LoginView.vue')
  },
  {
    path: '/',
    name: 'Calendar',
    component: () => import('../../views/calendar/CalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dishes',
    name: 'Dishes',
    component: () => import('../../views/dishes/DishesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../../views/home/HomeView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router