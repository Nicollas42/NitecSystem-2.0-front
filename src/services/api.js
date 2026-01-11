import axios from 'axios';

// Lógica inteligente:
// 1. Tenta pegar a URL da Vercel (import.meta.env.VITE_API_URL)
// 2. Se não existir (estiver no seu PC), usa 'http://127.0.0.1:8000'
// 3. Garante que não tenha barra duplicada e adiciona '/api' no final
const domain = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const baseURL = domain.endsWith('/') ? `${domain}api` : `${domain}/api`;

const api_erp = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Interceptador para injetar o token em TODAS as requisições automaticamente.
 */
api_erp.interceptors.request.use(config => {
    const token = localStorage.getItem('token_erp');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api_erp;