<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// AQUI ESTÁ A CORREÇÃO: Usamos nossa instância que carrega o token
import api_erp from '@/services/api';

// Componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';

const router = useRouter();
const usuario = ref({ 
    nome_completo: 'Carregando...', 
    email: '',
    celular: '' 
});

const buscar_dados_usuario = async () => {
    try {
        // Agora usamos api_erp.get('/user'). 
        // Ele vai injetar o token 'Bearer ...' automaticamente no header.
        const resposta = await api_erp.get('/user');
        
        usuario.value = resposta.data;

    } catch (erro) {
        console.error("Sessão expirada ou erro ao buscar usuário:", erro);
        
        // Se der erro (ex: token venceu), limpa tudo e chuta pro login
        localStorage.removeItem('token_erp');
        router.push('/');
    }
};

const fazer_logout = async () => {
    try {
        // Tenta avisar o backend que saiu
        await api_erp.post('/logout');
    } catch (e) {
        // Se der erro, não importa, o importante é limpar o front
    } finally {
        localStorage.removeItem('token_erp');
        router.push('/');
    }
};

onMounted(() => {
    buscar_dados_usuario();
});
</script>

<template>
    <div class="dashboard_container">
        <div class="navbar">
            <h2 class="logo">Nitec ERP</h2>
            <Button 
                label="Sair" 
                icon="pi pi-sign-out" 
                severity="danger" 
                text 
                @click="fazer_logout" 
            />
        </div>

        <div class="conteudo">
            <Card class="card_boasvindas">
                <template #title>
                    Olá, {{ usuario.nome_completo }}!
                </template>
                <template #content>
                    <div class="info_usuario">
                        <p>Você está logado no sistema com segurança.</p>
                        <ul class="lista_dados">
                            <li><strong>E-mail:</strong> {{ usuario.email }}</li>
                            <li><strong>Celular:</strong> {{ usuario.celular || 'Não informado' }}</li>
                        </ul>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.dashboard_container { min-height: 100vh; background-color: #f8f9fa; }

.navbar { 
    background: white; 
    padding: 1rem 2rem; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
}

.logo { margin: 0; color: #111827; }

.conteudo { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.card_boasvindas { margin-top: 20px; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

.info_usuario { margin-top: 1rem; }
.lista_dados { list-style: none; padding: 0; }
.lista_dados li { margin-bottom: 0.5rem; color: #4b5563; }
</style>