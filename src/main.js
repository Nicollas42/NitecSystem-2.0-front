import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios' // <--- 1. Importe o Axios

// Importando PrimeVue e o Tema Aura (que é bem moderno)
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

const app = createApp(App)

axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';

const token_erp = localStorage.getItem('token_erp');

if (token_erp) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token_erp}`;
}

// Interceptador: Se o servidor responder 401 (Token expirado/inválido), desloga o usuário
axios.interceptors.response.use(
    resposta => resposta, 
    erro => {
        if (erro.response && erro.response.status === 401) {
            // Limpa o token inválido
            localStorage.removeItem('token_erp');
            // Redireciona para login (usando window.location para forçar refresh ou router)
            window.location.href = '/';
        }
        return Promise.reject(erro);
    }
);

app.use(createPinia())
app.use(router)

// Configuração do Tema
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark', // Desativa modo escuro automático por enquanto
        }
    }
});

app.mount('#app')