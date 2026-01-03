import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '../views/RegisterView.vue' // <--- IMPORTADO
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'; // Importe o arquivo

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('token_erp')) {
            next('/dashboard');
        } else {
            next();
        }
      }
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: RegisterView // <--- NOVA ROTA
    },
    {
      path: '/esqueci-senha',
      name: 'esqueci-senha',
      component: ForgotPasswordView
    },
    {
    path: '/redefinir-senha',
    name: 'redefinir-senha',
    component: ResetPasswordView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requer_autenticacao: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
    if (to.meta.requer_autenticacao && !localStorage.getItem('token_erp')) {
        next('/'); 
    } else {
        next(); 
    }
});

export default router