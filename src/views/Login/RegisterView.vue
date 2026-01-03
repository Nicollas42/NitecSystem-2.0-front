<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importamos a NOSSA instância configurada em vez do axios puro
import api_erp from '@/services/api'; 

// Componentes PrimeVue... (mantive os imports iguais)
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();

const formulario = ref({
    nome_completo: '',
    email: '',
    celular: '',
    password: '',
    password_confirmation: ''
});

const carregando = ref(false);
const erro_api = ref('');

/**
 * Envia os dados para a API Laravel usando a instância centralizada
 */
const realizar_cadastro = async () => {
    erro_api.value = '';
    
    if (formulario.value.password !== formulario.value.password_confirmation) {
        erro_api.value = 'As senhas não coincidem.';
        return;
    }

    carregando.value = true;

    try {
        // Agora usamos apenas a rota relativa. O http://... vem do arquivo api.js
        const resposta = await api_erp.post('/cadastrar', formulario.value);
        
        // Salva o token
        localStorage.setItem('token_erp', resposta.data.access_token);
        
        // NÃO precisa mais configurar o header manualmente aqui, 
        // o interceptor no api.js vai ler o localStorage automaticamente na próxima requisição.
        
        alert('Cadastro realizado com sucesso!');
        router.push('/dashboard');

    } catch (erro) {
        if (erro.response && erro.response.data && erro.response.data.errors) {
            const lista_erros = Object.values(erro.response.data.errors);
            erro_api.value = lista_erros[0][0]; 
        } else if (erro.response && erro.response.data.mensagem) {
            erro_api.value = erro.response.data.mensagem;
        } else {
            erro_api.value = 'Erro ao conectar com o servidor.';
        }
    } finally {
        carregando.value = false;
    }
};
</script>