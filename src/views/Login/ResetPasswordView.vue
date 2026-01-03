<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Importação da nossa instância configurada
import api_erp from '@/services/api';

// Componentes PrimeVue
import Card from 'primevue/card';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const route = useRoute();
const router = useRouter();

// Variáveis reativas (snake_case)
const nova_senha = ref('');
const confirmacao_senha = ref('');
const token_url = ref('');
const email_url = ref('');
const esta_carregando = ref(false);
const mensagem_feedback = ref('');
const tipo_mensagem = ref('');

onMounted(() => {
    token_url.value = route.query.token;
    email_url.value = route.query.email;

    if (!token_url.value || !email_url.value) {
        tipo_mensagem.value = 'error';
        mensagem_feedback.value = 'Link inválido ou expirado.';
    }
});

/**
 * Envia a nova senha para a API.
 */
const salvar_nova_senha = async () => {
    mensagem_feedback.value = '';

    if (nova_senha.value.length < 6) {
        mensagem_feedback.value = 'A senha deve ter no mínimo 6 caracteres.';
        tipo_mensagem.value = 'error';
        return;
    }

    if (nova_senha.value !== confirmacao_senha.value) {
        mensagem_feedback.value = 'As senhas não coincidem.';
        tipo_mensagem.value = 'error';
        return;
    }

    esta_carregando.value = true;

    try {
        // Rota relativa no backend
        await api_erp.post('/redefinir-senha-final', {
            token: token_url.value,
            email: email_url.value,
            password: nova_senha.value,
            password_confirmation: confirmacao_senha.value
        });

        tipo_mensagem.value = 'success';
        mensagem_feedback.value = 'Senha alterada com sucesso! Redirecionando...';
        
        // Redireciona para o login após 3 segundos
        setTimeout(() => router.push('/'), 3000);

    } catch (erro) {
        tipo_mensagem.value = 'error';
        if (erro.response && erro.response.data) {
            mensagem_feedback.value = erro.response.data.mensagem || 'Erro ao redefinir senha.';
        } else {
            mensagem_feedback.value = 'Erro de conexão com o servidor.';
        }
    } finally {
        esta_carregando.value = false;
    }
};
</script>

<template>
    <div class="container_reset">
        <div class="wrapper_centralizado">
            <Card class="card_customizado">
                <template #title>
                    <h2 class="titulo_erp">Criar Nova Senha</h2>
                </template>

                <template #content>
                    <Message v-if="mensagem_feedback" :severity="tipo_mensagem" class="mensagem_alerta">
                        {{ mensagem_feedback }}
                    </Message>

                    <form v-if="token_url" @submit.prevent="salvar_nova_senha" class="formulario_reset">
                        
                        <div class="grupo_input">
                            <label for="senha_nova">Nova Senha</label>
                            <Password 
                                id="senha_nova" 
                                v-model="nova_senha" 
                                toggleMask 
                                :feedback="true"
                                promptLabel="Escolha uma senha"
                                weakLabel="Fraca"
                                mediumLabel="Média"
                                strongLabel="Forte"
                                class="input_senha_wrapper"
                                inputClass="input_largo"
                            />
                        </div>

                        <div class="grupo_input">
                            <label for="senha_confirma">Confirmar Senha</label>
                            <Password 
                                id="senha_confirma" 
                                v-model="confirmacao_senha" 
                                :feedback="false"
                                toggleMask 
                                class="input_senha_wrapper" 
                                inputClass="input_largo"
                            />
                        </div>

                        <div class="grupo_botao">
                            <Button 
                                type="submit" 
                                label="SALVAR NOVA SENHA" 
                                icon="pi pi-check-circle" 
                                :loading="esta_carregando" 
                                fluid 
                            />
                        </div>
                    </form>
                    
                    <div v-else class="link_invalido">
                        <Button label="Voltar ao Login" link @click="router.push('/')" />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.container_reset { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f3f4f6; }
.wrapper_centralizado { width: 100%; max-width: 400px; padding: 20px; }
.card_customizado { border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.titulo_erp { text-align: center; color: #111827; margin-bottom: 1rem; }
.formulario_reset { display: flex; flex-direction: column; gap: 1.5rem; }
.grupo_input { display: flex; flex-direction: column; gap: 0.5rem; }
.input_largo { width: 100%; }
.input_senha_wrapper { width: 100%; }
:deep(.p-password-input) { width: 100%; }
.mensagem_alerta { margin-bottom: 1rem; }
.link_invalido { text-align: center; margin-top: 1rem; }
</style>