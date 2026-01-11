<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// MUDANÇA 1: Importar a API centralizada
import api from '@/services/api'; 

const router = useRouter();
const carregando = ref(false);

const form = ref({
    nome: '',
    cpf: '',
    celular: '',
    email: '',
    password: '',
    password_confirmation: '',
    empresa: {
        nome_fantasia: '',
        cnpj: '',
        telefone: '',
        endereco: ''
    },
    filiais: [] 
});

const adicionar_filial = () => {
    form.value.filiais.push({ nome: '', cnpj: '', endereco: '' });
};

const remover_filial = (index) => {
    form.value.filiais.splice(index, 1);
};

const realizar_cadastro = async () => {
    if (form.value.password !== form.value.password_confirmation) {
        return alert("As senhas não conferem!");
    }

    carregando.value = true;
    try {
        // MUDANÇA 2: Chamada limpa (sem http://localhost...)
        const res = await api.post('/cadastrar', form.value);
        
        alert("Cadastro realizado com sucesso! Bem-vindo.");
        
        // Salva o token para o usuário já entrar logado
        localStorage.setItem('token_erp', res.data.token);
        router.push('/dashboard'); 
        
    } catch (error) {
        console.error("Erro completo:", error);
        
        if (error.response && error.response.status === 422) {
            const erros = error.response.data.errors;
            let mensagemErro = "⚠️ Erro de Validação:\n";
            Object.keys(erros).forEach(campo => {
                mensagemErro += `• ${campo}: ${erros[campo][0]}\n`;
            });
            alert(mensagemErro);
        } else {
            alert("Erro ao cadastrar: " + (error.response?.data?.message || error.message));
        }
    } finally {
        carregando.value = false;
    }
};
</script>

<template>
  <div class="register_container">
    <div class="card_register">
      <div class="header_register">
        <h2>Crie sua conta</h2>
        <p>Gerencie sua Matriz e Filiais em um só lugar.</p>
      </div>

      <form @submit.prevent="realizar_cadastro">
        
        <div class="secao_form">
            <h3>1. Dados do Administrador</h3>
            
            <div class="grupo_input">
                <label>Nome Completo</label>
                <input type="text" v-model="form.nome" required placeholder="Seu nome" class="input_padrao">
            </div>

            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>CPF</label>
                    <input type="text" v-model="form.cpf" required placeholder="000.000.000-00" class="input_padrao" maxlength="14">
                </div>
                <div class="grupo_input">
                    <label>Celular (WhatsApp)</label> <input type="text" v-model="form.celular" required placeholder="(00) 00000-0000" class="input_padrao">
                </div>
            </div>

            <div class="grupo_input">
                <label>E-mail de Acesso</label>
                <input type="email" v-model="form.email" required placeholder="seu@email.com" class="input_padrao">
            </div>

            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>Senha</label>
                    <input type="password" v-model="form.password" required placeholder="******" class="input_padrao">
                </div>
                <div class="grupo_input">
                    <label>Confirmar Senha</label>
                    <input type="password" v-model="form.password_confirmation" required placeholder="******" class="input_padrao">
                </div>
            </div>
        </div>

        <div class="secao_form destaque">
            <h3>2. Dados da Matriz</h3>
            
            <div class="grupo_input">
                <label>Nome da Padaria (Matriz)</label>
                <input type="text" v-model="form.empresa.nome_fantasia" required placeholder="Ex: Padaria do João - Matriz" class="input_padrao">
            </div>

            <div class="linha_dupla">
                <div class="grupo_input">
                    <label>CNPJ da Matriz</label>
                    <input type="text" v-model="form.empresa.cnpj" required placeholder="00.000.000/0001-00" class="input_padrao" maxlength="18">
                </div>
                <div class="grupo_input">
                    <label>Telefone Loja</label>
                    <input type="text" v-model="form.empresa.telefone" class="input_padrao">
                </div>
            </div>

            <div class="grupo_input">
                <label>Endereço Completo (Matriz)</label> <input type="text" v-model="form.empresa.endereco" required placeholder="Rua, Número, Bairro - Cidade/UF" class="input_padrao">
            </div>
        </div>

        <div class="secao_form">
            <div class="cabecalho_filiais">
                <h3>3. Filiais (Opcional)</h3>
                <button type="button" class="btn_pequeno" @click="adicionar_filial">+ Add Filial</button>
            </div>

            <p class="ajuda">Cadastre os endereços e CNPJs das suas outras unidades.</p>

            <div v-for="(filial, index) in form.filiais" :key="index" class="card_filial">
                <div class="filial_header">
                    <strong>Filial #{{ index + 1 }}</strong>
                    <button type="button" class="btn_remover" @click="remover_filial(index)">Remover</button>
                </div>
                
                <div class="linha_dupla">
                    <div class="grupo_input">
                        <label>Nome da Filial</label>
                        <input type="text" v-model="filial.nome" placeholder="Ex: Unidade Centro" class="input_padrao">
                    </div>
                    <div class="grupo_input">
                        <label>CNPJ da Filial</label>
                        <input type="text" v-model="filial.cnpj" placeholder="CNPJ da Filial" class="input_padrao" maxlength="18">
                    </div>
                </div>

                <div class="grupo_input">
                    <label>Endereço da Filial</label> <input type="text" v-model="filial.endereco" placeholder="Endereço desta unidade" class="input_padrao">
                </div>
            </div>
        </div>

        <div class="acoes_form">
            <button type="submit" class="btn_cadastrar" :disabled="carregando">
                {{ carregando ? 'Criando conta...' : 'Finalizar Cadastro' }}
            </button>
            <router-link to="/" class="link_voltar">Já tenho conta</router-link>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* MANTER O MESMO CSS DO ARQUIVO ORIGINAL */
.register_container { min-height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #f3f4f6; padding: 20px; font-family: 'Segoe UI', sans-serif; }
.card_register { background: white; width: 100%; max-width: 650px; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.header_register { text-align: center; margin-bottom: 30px; }
.header_register h2 { color: #1f2937; margin-bottom: 5px; }
.header_register p { color: #6b7280; font-size: 14px; }
.secao_form { margin-bottom: 25px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
.secao_form h3 { font-size: 16px; color: #4f46e5; margin-bottom: 15px; border-left: 3px solid #4f46e5; padding-left: 8px; }
.secao_form.destaque { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px dashed #d1d5db; }
.grupo_input { margin-bottom: 10px; display: flex; flex-direction: column; }
.grupo_input label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.input_padrao { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 15px; outline: none; width: 100%; box-sizing: border-box; }
.input_padrao:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.cabecalho_filiais { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.btn_pequeno { background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
.card_filial { background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 10px; border: 1px solid #e5e7eb; }
.filial_header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
.btn_remover { color: #ef4444; background: none; border: none; cursor: pointer; font-size: 11px; text-decoration: underline; }
.ajuda { font-size: 12px; color: #9ca3af; margin-bottom: 10px; font-style: italic; }
.acoes_form { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
.btn_cadastrar { background-color: #4f46e5; color: white; padding: 12px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn_cadastrar:hover { background-color: #4338ca; }
.btn_cadastrar:disabled { opacity: 0.7; cursor: not-allowed; }
.link_voltar { text-align: center; color: #6b7280; text-decoration: none; font-size: 14px; }
.link_voltar:hover { color: #111827; }
</style>