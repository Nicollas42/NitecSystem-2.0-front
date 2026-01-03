import { createRouter, createWebHistory } from 'vue-router'

// --- Layout Principal ---
import DashboardLayout from '../layouts/DashboardLayout.vue'

// --- CORREÇÃO: Apontando para a pasta "Login" ---
import LoginView from '../views/Login/LoginView.vue'
import RegisterView from '../views/Login/RegisterView.vue'
import ForgotPasswordView from '../views/Login/ForgotPasswordView.vue'
import ResetPasswordView from '../views/Login/ResetPasswordView.vue'

// --- Dashboard (Se estiver na raiz de views) ---
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ROTAS PÚBLICAS
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
      component: RegisterView
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

    // ROTAS PROTEGIDAS
    {
      path: '/', 
      component: DashboardLayout,
      meta: { requer_autenticacao: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'frente-de-caixa',
          name: 'caixa',
          component: () => import('../views/Caixa/CaixaView.vue')
        },
        {
          path: 'financeiro', 
          name: 'financeiro',
          component: () => import('../views/Financeiro/FinanceiroView.vue')
        },
        {
          path: 'estoque',
          name: 'estoque',
          component: () => import('../views/Estoque/EstoqueView.vue')
        },
        {
          path: 'sobras',
          name: 'sobras',
          component: () => import('../views/Sobras/SobrasView.vue')
        }
      ]
    }
  ]
})

// GUARD GLOBAL
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requer_autenticacao)) {
        if (!localStorage.getItem('token_erp')) {
            next('/'); 
        } else {
            next(); 
        }
    } else {
        next(); 
    }
});

export default router