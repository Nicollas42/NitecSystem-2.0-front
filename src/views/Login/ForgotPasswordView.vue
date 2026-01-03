<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importação da nossa instância configurada
import api_erp from '@/services/api';

// Componentes PrimeVue
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const email_recuperacao = ref('');
const esta_carregando = ref(false);
const mensagem_feedback = ref('');
const tipo_mensagem = ref(''); 

const solicitar_reset = async () => {
    mensagem_feedback.value = '';
    
    if (!email_recuperacao.value) {
        mensagem_feedback.value = 'Por favor, digite o e-mail.';
        tipo_mensagem.value = 'error';
        return;
    }

    esta_carregando.value = true;

    try {
        // Chamada limpa usando a rota relativa
        // O baseURL do api.js já cuida do http://...
        const resposta = await api_erp.post('/esqueci-senha', {
            email: email_recuperacao.value
        });

        tipo_mensagem.value = 'success';
        mensagem_feedback.value = resposta.data.mensagem || 'E-mail enviado! Verifique sua caixa de entrada.';
        
    } catch (erro) {
        tipo_mensagem.value = 'error';
        
        if (erro.response) {
            // Erro retornado pela API (ex: 404 Email não encontrado)
            mensagem_feedback.value = erro.response.data.message || erro.response.data.mensagem || 'Erro ao processar solicitação.';
        } else {
            mensagem_feedback.value = "Erro de conexão com o servidor.";
        }
    } finally {
        esta_carregando.value = false;
    }
};
</script>

<template>
    <div class="container_recuperacao">
        <div class="wrapper_centralizado">
            <Card class="card_customizado">
                <template #title>
                    <h2 class="titulo_erp">Recuperar Senha</h2>
                </template>

                <template #content>
                    <Message v-if="mensagem_feedback" :severity="tipo_mensagem" class="mensagem_alerta">
                        {{ mensagem_feedback }}
                    </Message>

                    <form @submit.prevent="solicitar_reset" class="formulario_reset">
                        
                        <div class="grupo_input">
                            <label for="email_input">E-mail Cadastrado</label>
                            <InputText 
                                id="email_input" 
                                v-model="email_recuperacao" 
                                placeholder="ex: admin@erp.com" 
                                class="input_largo" 
                            />
                        </div>

                        <div class="grupo_botao">
                            <Button 
                                type="submit" 
                                label="ENVIAR LINK" 
                                icon="pi pi-send" 
                                :loading="esta_carregando" 
                                fluid 
                            />
                            
                            <div class="links_voltar">
                                <a @click="router.push('/')" class="link_acao">
                                    Voltar para Login
                                </a>
                            </div>
                        </div>
                    </form>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.container_recuperacao { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f3f4f6; }
.wrapper_centralizado { width: 100%; max-width: 400px; padding: 20px; }
.card_customizado { border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.titulo_erp { text-align: center; color: #111827; margin-bottom: 1rem; }
.formulario_reset { display: flex; flex-direction: column; gap: 1.5rem; }
.grupo_input { display: flex; flex-direction: column; gap: 0.5rem; }
.input_largo { width: 100%; }
.mensagem_alerta { margin-bottom: 1rem; }
.links_voltar { margin-top: 1rem; text-align: center; }
.link_acao { cursor: pointer; color: #4f46e5; font-weight: 600; }
</style>