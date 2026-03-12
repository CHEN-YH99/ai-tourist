import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load views
const Home = () => import('@/views/Home.vue')
const Chat = () => import('@/views/Chat.vue')
const ItineraryGenerator = () => import('@/views/ItineraryGenerator.vue')
const Destinations = () => import('@/views/Destinations.vue')
const Profile = () => import('@/views/Profile.vue')
const Collections = () => import('@/views/Collections.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: false }
  },
  {
    path: '/itinerary',
    name: 'ItineraryGenerator',
    component: ItineraryGenerator,
    meta: { requiresAuth: true }
  },
  {
    path: '/destinations',
    name: 'Destinations',
    component: Destinations
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/collections',
    name: 'Collections',
    component: Collections,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    // Redirect to home if user is already authenticated and tries to access login/register
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
