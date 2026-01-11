<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api_request } from '@/services/api_helper';

// Componentes PrimeVue
import Card from 'primevue/card';

const router = useRouter();
const usuario = ref(null); // Inicia como null para facilitar o v-if

const buscar_dados_usuario = async () => {
    try {
        // A rota /user do Laravel geralmente retorna o model User direto
        const resposta_api = await api_request('get', '/user');
        
        console.log('Dados recebidos:', resposta_api);

        // CORREÇÃO: O api_helper já entrega o JSON pronto.
        // Se a resposta tiver um ID, assumimos que é o usuário.
        if (resposta_api && resposta_api.id) {
            usuario.value = resposta_api; 
        } else {
            console.warn('Resposta da API inesperada:', resposta_api);
        }

    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);
        // Se der erro de autenticação, o api_helper já redireciona, 
        // mas podemos forçar limpeza se necessário:
        // localStorage.removeItem('token_erp');
        // router.push('/');
    }
};

onMounted(() => {
    buscar_dados_usuario();
});
</script>

<template>
    <div class="dashboard_container">
        <div class="conteudo">
            <Card class="card_boasvindas">
                <template #title>
                    Olá, {{ usuario?.nome_completo || 'Usuário' }}!
                </template>
                <template #content>
                    <div class="info_usuario" v-if="usuario">
                        <p>Você está logado no sistema com segurança.</p>
                        <ul class="lista_dados">
                            <li><strong>E-mail:</strong> {{ usuario.email }}</li>
                            <li><strong>Celular:</strong> {{ usuario.celular || 'Não informado' }}</li>
                            <li><strong>Empresa ID:</strong> {{ usuario.empresa_id }}</li>
                        </ul>
                    </div>
                    
                    <div v-else class="loading_state">
                        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
                        <p>Carregando informações...</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.dashboard_container { 
    min-height: 100vh; 
    background-color: #f8f9fa; 
}

.conteudo { 
    padding: 2rem; 
    max-width: 1200px; 
    margin: 0 auto; 
}

.card_boasvindas { 
    margin-top: 20px; 
    border: none; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
}

.info_usuario { 
    margin-top: 1rem; 
}

.lista_dados { 
    list-style: none; 
    padding: 0; 
}

.lista_dados li { 
    margin-bottom: 0.5rem; 
    color: #4b5563; 
}

.loading_state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
}
</style>