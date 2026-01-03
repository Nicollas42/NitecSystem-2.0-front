import axios from 'axios';

/**
 * Criação da instância do Axios com a URL base definida no .env
 * Isso evita ter que digitar o endereço completo toda vez.
 */
const api_erp = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Interceptador para injetar o token em TODAS as requisições automaticamente.
 * Assim você não precisa configurar o header manualmente no Login/Register toda vez.
 */
api_erp.interceptors.request.use(config => {
    const token = localStorage.getItem('token_erp');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api_erp;