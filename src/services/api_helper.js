/**
 * Helper de API para substituir o Axios.
 * Compatível com Laravel Sanctum e Upload de Arquivos.
 */

const domain = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const base_url = domain.endsWith('/') ? `${domain}api` : `${domain}/api`;

function get_cookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export async function api_request(method, endpoint, data = null, custom_headers = {}) {
    
    const token = localStorage.getItem('token_erp');
    const xsrf_token = get_cookie('XSRF-TOKEN');

    // Verifica se é upload de arquivo
    const isFormData = data instanceof FormData;

    const headers = {
        'Accept': 'application/json',
        ...custom_headers
    };

    // SÓ adiciona Content-Type JSON se NÃO for FormData.
    // Para FormData, o navegador define automaticamente o Boundary.
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (xsrf_token) headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf_token);

    const method_upper = method.toUpperCase();
    
    // Tratamento de URL
    let clean_endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (clean_endpoint.startsWith('http')) {
        const urlObj = new URL(clean_endpoint);
        clean_endpoint = urlObj.pathname + urlObj.search;
    }

    let full_url = `${base_url}${clean_endpoint}`;

    const config = {
        method: method_upper,
        headers: headers,
        credentials: 'include'
    };

    // Lógica de Envio
    if (method_upper === 'GET' || method_upper === 'HEAD') {
        if (data && !isFormData) {
            let params = data.params ? data.params : data;
            const cleanParams = {};
            for (const key in params) {
                if (key !== 'headers') cleanParams[key] = params[key];
            }
            const queryString = new URLSearchParams(cleanParams).toString();
            const separator = full_url.includes('?') ? '&' : '?';
            if (queryString) full_url += `${separator}${queryString}`;
        }
    } else {
        // CORREÇÃO CRÍTICA AQUI:
        if (data) {
            config.body = isFormData ? data : JSON.stringify(data);
        }
    }

    try {
        // Proteção contra URL duplicada
        if (endpoint.startsWith('http')) full_url = endpoint;

        const response = await fetch(full_url, config);

        if (response.status === 401 || response.status === 419) {
            console.warn(`Sessão expirada (${response.status}).`);
            localStorage.removeItem('token_erp');
            // window.location.href = '/login'; 
            return null; 
        }

        if (!response.ok) {
            // Tenta ler o erro como JSON primeiro
            const error_text = await response.text();
            let error_json;
            try {
                error_json = JSON.parse(error_text);
            } catch (e) {
                error_json = { message: error_text };
            }
            
            // Monta uma mensagem de erro mais útil
            const msg = error_json.message || `Erro ${response.status}`;
            const errorObj = new Error(msg);
            errorObj.response = { data: error_json, status: response.status }; // Imita estrutura do Axios para compatibilidade
            throw errorObj;
        }

        const text_data = await response.text();
        return text_data ? JSON.parse(text_data) : {};

    } catch (error) {
        console.error(`Erro API [${method_upper}]:`, error);
        throw error;
    }
}