<template>
  <div class="container_negocio">
    
    <div class="cabecalho">
        <div>
            <h1>Meu Negócio (Multi-Lojas)</h1>
            <p class="subtitulo">Selecione abaixo em qual loja você deseja trabalhar agora.</p>
        </div>
        <button class="btn_salvar" @click="salvar_tudo" :disabled="carregando">
            {{ carregando ? 'Salvando...' : '💾 Salvar Dados' }}
        </button>
    </div>

    <div v-if="carregando && !matriz" class="loading_state">
        <p>Carregando lojas...</p>
    </div>

    <div class="grid_lojas" v-else>
        
        <LojaCard 
            v-if="matriz" 
            :loja="matriz" 
            :isMatriz="true"
            :isAtiva="loja_ativa_id === matriz.id"
            @request-unlock="tentar_desbloquear" 
            @selecionar="definir_loja_ativa"
        />

        <LojaCard 
            v-for="(filial, index) in filiais" 
            :key="index"
            :loja="filial"
            :isMatriz="false"
            :index="index"
            :isAtiva="loja_ativa_id === filial.id"
            @request-unlock="tentar_desbloquear"
            @delete="remover_filial"
            @selecionar="definir_loja_ativa"
        />

        <div class="card_adicionar" @click="add_filial">
            <span>+ Adicionar Nova Filial</span>
        </div>
    </div>

    <PasswordModal 
        :isOpen="modal_aberto"
        mensagem="Senha para editar dados cadastrais:"
        @close="modal_aberto = false"
        @confirm="verificar_senha_api"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api_request } from '@/services/api_helper'; // Ajuste o caminho se necessário
import LojaCard from './Components/LojaCard.vue';
import PasswordModal from './Components/PasswordModal.vue';

const matriz = ref(null);
const filiais = ref([]);
const carregando = ref(false);
const modal_aberto = ref(false);
const loja_alvo = ref(null);
const loja_ativa_id = ref(null);

const carregar_dados = async () => {
    carregando.value = true;
    try {
        const res = await api_request('get', '/minhas-lojas');
        
        console.log('Dados recebidos:', res); // Debug

        // Helper para formatar dados
        const formatar = (l) => ({ 
            id: l.id,
            nome_fantasia: l.nome_fantasia,
            documento: l.cnpj, 
            telefone: l.telefone || '',
            endereco: l.endereco || '',
            bloqueado: true 
        });

        // --- CORREÇÃO AQUI ---
        // Removemos o ".data" pois api_request já retorna o objeto limpo
        if (res && res.matriz) {
            matriz.value = formatar(res.matriz);
        }

        if (res && res.filiais) {
            filiais.value = res.filiais.map(formatar);
        }

        // Recuperar contexto
        const salvo = localStorage.getItem('loja_ativa_id');
        if (salvo) {
            loja_ativa_id.value = parseInt(salvo);
        } else if (matriz.value) {
            definir_loja_ativa(matriz.value.id);
        }

    } catch (error) { 
        console.error("Erro ao carregar lojas:", error); 
    } finally { 
        carregando.value = false; 
    }
};

const definir_loja_ativa = (id) => {
    loja_ativa_id.value = id;
    localStorage.setItem('loja_ativa_id', id);
};

// --- LÓGICA DE BLOQUEIO ---
const tentar_desbloquear = (loja) => {
    if (!loja.bloqueado) { loja.bloqueado = true; return; }
    loja_alvo.value = loja;
    modal_aberto.value = true;
};

const verificar_senha_api = async (senha) => {
    try {
        await api_request('post', '/verificar-senha', { password: senha });
        if (loja_alvo.value) loja_alvo.value.bloqueado = false;
        modal_aberto.value = false;
    } catch (error) { 
        alert("Senha incorreta!"); 
    }
};

const salvar_tudo = async () => {
    carregando.value = true;
    try {
        if (matriz.value && !matriz.value.bloqueado) {
            await update_api(matriz.value);
            matriz.value.bloqueado = true;
        }
        for (const f of filiais.value) {
            if (!f.bloqueado && f.id) {
                await update_api(f);
                f.bloqueado = true;
            }
        }
        alert("Dados atualizados!");
    } catch (e) { 
        alert("Erro ao salvar."); 
    } finally { 
        carregando.value = false; 
    }
};

const update_api = async (loja) => {
    await api_request('put', `/lojas/${loja.id}`, {
        nome_fantasia: loja.nome_fantasia,
        documento: loja.documento,
        telefone: loja.telefone,
        endereco: loja.endereco
    });
};

const add_filial = () => {
    filiais.value.push({ nome_fantasia: 'Nova Filial', documento: '', bloqueado: false });
};
const remover_filial = (i) => filiais.value.splice(i, 1);

onMounted(carregar_dados);
</script>

<style scoped>
.container_negocio { padding: 20px; color: var(--text-primary); }
.subtitulo { font-size: 14px; color: var(--text-secondary); margin-top: 5px; }
.cabecalho { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.grid_lojas { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.btn_salvar { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn_salvar:disabled { opacity: 0.7; }
.card_adicionar { border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.7; min-height: 250px; font-weight: bold; color: var(--text-secondary); background: var(--bg-card); }
.card_adicionar:hover { border-color: var(--primary-color); color: var(--primary-color); opacity: 1; }
.loading_state { text-align: center; padding: 40px; color: var(--text-secondary); }
</style>