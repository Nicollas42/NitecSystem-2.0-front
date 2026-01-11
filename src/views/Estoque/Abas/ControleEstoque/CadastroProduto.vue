<template>
  <form @submit.prevent="submit" class="form_cadastro" :class="{ 'modo_edicao': !!produtoEdicao }">
    
    <div class="header_form" v-if="produtoEdicao">
        <h4>Editando: {{ produtoEdicao.nome }}</h4>
    </div>

    <div class="nav_tipos">
        <label :class="['card_radio', { selecionado: form.tipo_item === 'REVENDA' }]">
            <input type="radio" value="REVENDA" v-model="form.tipo_item">
            <span>🛒 Revenda</span>
        </label>
        <label :class="['card_radio', { selecionado: form.tipo_item === 'INSUMOS' }]">
            <input type="radio" value="INSUMOS" v-model="form.tipo_item">
            <span>🌾 Insumos</span>
        </label>
        <label :class="['card_radio', { selecionado: form.tipo_item === 'INTERNO' }]">
            <input type="radio" value="INTERNO" v-model="form.tipo_item">
            <span>👨‍🍳 Interno</span>
        </label>
    </div>

    <div class="secao_form">
        <h3 class="subtitulo_form">1. Identificação do Item</h3>
        
        <FormIdentificacao 
            :form="form" 
            :fornecedores="lista_fornecedores"
            @abrir-modal-fornecedor="abrirModalNovo"
            @editar-fornecedor="abrirModalEdicao"
        >
            <template #imagem>
                <UploadImagem 
                    label="FOTO"
                    :imagemAtualPath="form.imagem_path_banco"
                    @arquivo-selecionado="(f) => form.imagem_arquivo_raw = f"
                />
            </template>
        </FormIdentificacao>
    </div>

    <FormRevenda v-if="form.tipo_item === 'REVENDA'" :form="form" />
    <FormInsumo v-if="form.tipo_item === 'INSUMOS'" :form="form" />
    <FormInterno v-if="form.tipo_item === 'INTERNO'" />

    <div class="area_botoes">
        <button type="button" class="botao_cancelar" @click="$emit('cancelar')">Cancelar</button>
        <button type="submit" class="botao_salvar">
            {{ produtoEdicao ? '💾 Salvar Alterações' : '✅ Cadastrar Produto' }}
        </button>
    </div>

    <ModalCadastroFornecedor 
        v-model:visivel="modalFornecedor"
        :dadosEdicao="fornecedorEmEdicao"
        @salvo="aoSalvarFornecedor"
    />

  </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import UploadImagem from '@/components/UploadImagem.vue';
import ModalCadastroFornecedor from '@/components/ModalCadastroFornecedor.vue';
import FormIdentificacao from './Partials/FormIdentificacao.vue';
import FormRevenda from './Partials/FormRevenda.vue';
import FormInsumo from './Partials/FormInsumo.vue';
import FormInterno from './Partials/FormInterno.vue';

// Importando a lógica do formulário (Composable)
import { useProdutoForm } from '@/composables/useProdutoForm';

const props = defineProps({ produtoEdicao: Object });
const emit = defineEmits(['salvo', 'cancelar']);

// Estado Local (UI e Listas)
const lista_fornecedores = ref([]);
const modalFornecedor = ref(false);
const fornecedorEmEdicao = ref(null); // Variável que controla se é edição ou novo

// Estado do Formulário (Vem do Composable useProdutoForm.js)
const { form, inicializarFormulario, salvarProduto } = useProdutoForm();

// --- Lógica de Carregamento ---
const carregar_fornecedores = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/fornecedores', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        lista_fornecedores.value = res.data;
    } catch (e) { console.error(e); }
};

// --- Lógica do Modal de Fornecedor ---
const abrirModalNovo = () => {
    fornecedorEmEdicao.value = null; // Garante que o modal abra vazio
    modalFornecedor.value = true;
};

const abrirModalEdicao = (idFornecedor) => {
    // Procura o objeto completo do fornecedor para preencher o modal
    const alvo = lista_fornecedores.value.find(f => f.id === idFornecedor);
    if (alvo) {
        fornecedorEmEdicao.value = alvo;
        modalFornecedor.value = true;
    }
};

const aoSalvarFornecedor = (fornecedorSalvo) => {
    // Verifica se o fornecedor já existia na lista (Edição)
    const index = lista_fornecedores.value.findIndex(f => f.id === fornecedorSalvo.id);
    
    if (index !== -1) {
        // EDIÇÃO: Atualiza os dados na lista localmente
        lista_fornecedores.value[index] = fornecedorSalvo;
    } else {
        // NOVO: Adiciona na lista e já deixa selecionado
        lista_fornecedores.value.push(fornecedorSalvo);
        form.value.fornecedor_id = fornecedorSalvo.id;
    }
};

// --- Ciclo de Vida ---
onMounted(() => {
    carregar_fornecedores();
    inicializarFormulario(props.produtoEdicao);
});

watch(() => props.produtoEdicao, (novoVal) => {
    inicializarFormulario(novoVal);
});

// --- Envio do Formulário Principal ---
const submit = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        await salvarProduto(lojaId, !!props.produtoEdicao);
        emit('salvo');
    } catch (e) {
        alert("Erro: " + (e.response?.data?.mensagem || e.message));
    }
};
</script>

<style scoped>
.form_cadastro { padding: 10px; }
.modo_edicao { background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 8px; margin-top: 10px; }
.header_form h4 { margin: 0 0 15px 0; color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }

.nav_tipos { display: flex; gap: 10px; margin-bottom: 20px; }
.card_radio { flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-secondary); background: var(--bg-page); }
.card_radio:hover { border-color: var(--primary-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.card_radio.selecionado { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); color: var(--primary-color); font-weight: bold; transform: translateY(-2px); }
.card_radio input { display: none; }
.card_radio span { font-size: 15px; }
.card_radio .tip { font-size: 11px; margin-top: 2px; opacity: 0.8; }

.secao_form { margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 15px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 15px; font-weight: bold; }

.area_botoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; padding-top: 15px; border-top: 1px solid var(--border-color); }
.botao_salvar { background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px; }
.botao_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 12px 25px; border-radius: 6px; cursor: pointer; color: var(--text-primary); }
</style>