<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api_request } from '@/services/api_helper'; // Importa nosso serviço
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

// Variáveis reativas em snake_case
const router = useRouter();
const login_usuario = ref('');
const senha_usuario = ref('');
const esta_carregando = ref(false);
const mensagem_erro = ref('');

/**
 * Envia as credenciais (e-mail ou celular) para a API.
 * Em caso de sucesso, salva o token e redireciona.
 * * @returns {Promise<void>}
 */
const realizar_login = async () => {
    mensagem_erro.value = '';

    if (!login_usuario.value || !senha_usuario.value) {
        mensagem_erro.value = 'Por favor, preencha todos os campos.';
        return;
    }

    esta_carregando.value = true;

    try {
        // Chamada limpa
        const resposta = await api_request('post', '/login', {
            login: login_usuario.value,
            password: senha_usuario.value
        });

        // CORREÇÃO 1: Removemos o .data pois o helper já entrega o JSON puro
        // Verifique se sua API retorna 'access_token' ou apenas 'token'
        const token = resposta.access_token || resposta.token; 

        if (token) {
            localStorage.setItem('token_erp', token);
            router.push('/dashboard');
        } else {
            // Caso a API retorne 200 OK mas sem token (ex: login falhou logicamente)
            throw new Error('Token não retornado pela API.');
        }

    } catch (erro) {
        console.error("Erro no login:", erro); // Importante para debug

        // CORREÇÃO 2: Adaptação do tratamento de erro
        // O helper lança um Error padrão do JS, acessamos a mensagem em erro.message
        if (erro.message && erro.message.includes('401')) {
            mensagem_erro.value = 'E-mail ou senha incorretos.';
        } else {
            // Tenta limpar a mensagem de erro caso venha suja do helper "Erro API: 400 - ..."
            mensagem_erro.value = erro.message.replace('Erro API: ', '') || 'Erro ao conectar com o servidor.';
        }
    } finally {
        esta_carregando.value = false;
    }
};

</script>

<template>
    <div class="container_login_fundo">
        <div class="wrapper_centralizado">
            <Card class="card_login_customizado">
                <template #title>
                    <h2 class="titulo_erp">Nitec ERP</h2>
                    <p class="subtitulo_login">Bem-vindo(a) de volta!</p>
                </template>

                <template #content>
                    <Message v-if="mensagem_erro" severity="error" class="mensagem_alerta">
                        {{ mensagem_erro }}
                    </Message>

                    <form @submit.prevent="realizar_login" class="formulario_login">
                        
                        <div class="grupo_input">
                            <label for="login">E-mail ou Celular</label>
                            <InputText 
                                id="login" 
                                v-model="login_usuario" 
                                placeholder="ex: admin@erp.com ou 8399999..." 
                                class="input_largo" 
                            />
                        </div>

                        <div class="grupo_input">
                            <label for="senha">Senha</label>
                            <Password 
                                id="senha" 
                                v-model="senha_usuario" 
                                :feedback="false" 
                                toggleMask 
                                placeholder="Digite sua senha" 
                                inputClass="input_largo" 
                                class="input_senha_wrapper" 
                            />
                        </div>

                        <div class="grupo_botao">
                            <Button 
                                type="submit" 
                                label="ACESSAR SISTEMA" 
                                icon="pi pi-sign-in" 
                                :loading="esta_carregando" 
                                fluid 
                            />
                            
                            <div class="links_extras">
                                <a @click="router.push('/cadastro')" class="link_acao">
                                    Não tem conta? Cadastre-se
                                </a>
                                <a @click="router.push('/esqueci-senha')" class="link_acao esqueci">
                                    Esqueci a senha
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
/* Classes CSS em snake_case conforme solicitado */
.container_login_fundo {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f3f4f6;
}

.wrapper_centralizado {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.card_login_customizado {
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.titulo_erp {
    text-align: center;
    color: #111827;
    margin-bottom: 0.5rem;
    font-weight: 700;
}

.subtitulo_login {
    text-align: center;
    color: #6b7280;
    margin-top: 0;
    font-size: 0.95rem;
}

.formulario_login {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.grupo_input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.grupo_input label {
    font-weight: 500;
    color: #374151;
    font-size: 0.9rem;
}

.input_largo {
    width: 100%;
}

/* Ajuste específico para o componente Password do PrimeVue */
.input_senha_wrapper {
    width: 100%;
}
:deep(.p-password-input) {
    width: 100%;
}

.mensagem_alerta {
    margin-bottom: 1rem;
}

.links_extras {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    font-size: 0.85rem;
}

.link_acao {
    cursor: pointer;
    color: #4f46e5;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
}

.link_acao:hover {
    color: #4338ca;
    text-decoration: underline;
}

.esqueci {
    color: #6b7280;
}
.esqueci:hover {
    color: #374151;
}
</style>