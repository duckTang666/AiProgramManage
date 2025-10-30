import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 使用懒加载优化应用启动速度
const Dashboard = () => import('@/views/Dashboard.vue')
const ProjectManagement = () => import('@/views/ProjectManagement.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const EmailConfirmation = () => import('@/views/EmailConfirmation.vue')
const ForgotPassword = () => import('@/views/ForgotPassword.vue')
const ResetPassword = () => import('@/views/ResetPassword.vue')
const Organizations = () => import('@/views/Organizations.vue')
const OrganizationDetail = () => import('@/views/OrganizationDetail.vue')
const ProjectDetail = () => import('@/views/ProjectDetail.vue')
const NotFound = () => import('@/views/NotFound.vue')
const DatabaseTest = () => import('@/views/DatabaseTest.vue')
const CompleteProfile = () => import('@/views/CompleteProfile.vue')
const DataDisplay = () => import('@/views/DataDisplay.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/project-management',
      name: 'project-management',
      component: ProjectManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/email-confirmation',
      name: 'email-confirmation',
      component: EmailConfirmation,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: { requiresGuest: true }
    },
    {
      path: '/organizations',
      name: 'organizations',
      component: Organizations,
      meta: { requiresAuth: true }
    },
    {
      path: '/organizations/:id',
      name: 'organization-detail',
      component: OrganizationDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/database-test',
      name: 'database-test',
      component: DatabaseTest
    },
    {
      path: '/data-display',
      name: 'data-display',
      component: DataDisplay,
      meta: { requiresAuth: true }
    },
    {
      path: '/complete-profile',
      name: 'complete-profile',
      component: CompleteProfile,
      meta: { requiresAuth: true, requiresProfile: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 等待认证初始化完成
  if (authStore.isLoading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.isLoading) {
          unwatch()
          resolve(null)
        }
      })
    })
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router