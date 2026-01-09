<template>
  <form @submit.prevent="submeter_form" class="form_cadastro" :class="{ 'modo_edicao': !!produtoEdicao }">
    
    <div class="header_form" v-if="produtoEdicao">
        <h4>Editando: {{ produtoEdicao.nome }}</h4>
    </div>

    <div class="nav_tipos">
        <label :class="['card_radio', { selecionado: form.tipo_item === 'REVENDA' }]">
            <input type="radio" value="REVENDA" v-model="form.tipo_item">
            <span>🛒 Revenda</span>
            <small class="tip">Venda direta</small>
        </label>
        <label :class="['card_radio', { selecionado: form.tipo_item === 'INSUMOS' }]">
            <input type="radio" value="INSUMOS" v-model="form.tipo_item">
            <span>🌾 Insumos</span>
            <small class="tip">Matéria-prima</small>
        </label>
        <label :class="['card_radio', { selecionado: form.tipo_item === 'INTERNO' }]">
            <input type="radio" value="INTERNO" v-model="form.tipo_item">
            <span>👨‍🍳 Interno</span>
            <small class="tip">Produção Própria</small>
        </label>
    </div>

    <div class="secao_form">
        <h3 class="subtitulo_form">1. Identificação do Item</h3>
        
        <div class="layout_identificacao">
            
            <div class="coluna_imagem">
                <UploadImagem 
                    label="FOTO"
                    :imagemAtualPath="form.imagem_path_banco"
                    @arquivo-selecionado="handleNovoArquivo"
                />
            </div>

            <div class="coluna_dados">
                
                <div class="grupo_input">
                    <label>Nome do Produto *</label>
                    <input type="text" v-model="form.nome" required class="input_padrao" placeholder="Ex: Coca-cola 2L">
                </div>

                <div class="grid_compacto">
                    
                    <div class="grupo_input" style="flex: 2;">
                        <label>Categoria *</label>
                        <select v-model="categoria_selecionada" class="input_padrao" required>
                            <option value="" disabled>Selecione...</option>
                            <option v-for="cat in LISTA_CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>

                    <div class="grupo_input" style="flex: 1; min-width: 90px;">
                        <label>Unidade *</label>
                        <select v-model="form.unidade_medida" required class="input_padrao">
                            <option v-for="u in LISTA_UNIDADES" :key="u.codigo" :value="u.codigo">{{ u.nome }}</option>
                        </select>
                    </div>

                    <div class="grupo_input" style="flex: 1; min-width: 80px;">
                        <label>ID (#)</label>
                        <input type="number" v-model="form.id" :disabled="!!produtoEdicao" placeholder="Auto" class="input_padrao">
                    </div>

                    <div class="grupo_input" style="flex: 2;">
                        <div v-if="['KG', 'L'].includes(form.unidade_medida)" class="flex_balanca">
                            <div class="check_balanca" title="Usar Balança">
                                <input type="checkbox" id="chk_b" v-model="usa_balanca">
                                <label for="chk_b">⚖️</label>
                            </div>
                            <input v-if="usa_balanca" type="number" v-model="form.codigo_balanca" class="input_padrao destaque_balanca" placeholder="Digito (Ex: 50)">
                            <input v-else type="text" v-model="form.codigo_barras" class="input_padrao" placeholder="EAN / Barras">
                        </div>
                        <div v-else>
                            <label>Cód. Barras (EAN)</label>
                            <input type="text" v-model="form.codigo_barras" class="input_padrao" placeholder="Leitor...">
                        </div>
                    </div>

                </div>
            </div>
        </div>
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

  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import UploadImagem from '@/components/UploadImagem.vue';
import FormRevenda from './forms/FormRevenda.vue';
import FormInsumo from './forms/FormInsumo.vue';
import FormInterno from './forms/FormInterno.vue';

const props = defineProps({ produtoEdicao: Object });
const emit = defineEmits(['salvo', 'cancelar']);

const LISTA_UNIDADES = [{ codigo: 'UN', nome: 'UN' }, { codigo: 'KG', nome: 'KG' }, { codigo: 'L', nome: 'LT' }, { codigo: 'CX', nome: 'CX' }];
const LISTA_CATEGORIAS = ["Panificação", "Confeitaria", "Bebidas", "Frios", "Insumos", "Outros"];

const categoria_selecionada = ref('Outros');
const usa_balanca = ref(false);

const form = ref({
    id: '', tipo_item: 'REVENDA', nome: '', 
    codigo_barras: '', codigo_balanca: '', 
    unidade_medida: 'UN', 
    preco_custo: '', preco_venda: '', 
    estoque_deposito: '', estoque_vitrine: '', 
    validade: '', estoque_infinito: false,
    imagem_path_banco: null, imagem_arquivo_raw: null
});

const handleNovoArquivo = (file) => { form.value.imagem_arquivo_raw = file; };

const preencher_form = () => {
    if (props.produtoEdicao) {
        const p = props.produtoEdicao;
        form.value = {
            id: p.id, tipo_item: p.tipo_item, nome: p.nome, 
            codigo_barras: p.codigo_barras, codigo_balanca: p.codigo_balanca, 
            unidade_medida: p.unidade_medida,
            preco_custo: p.preco_custo, preco_venda: p.preco_venda,
            estoque_deposito: p.estoque_deposito, estoque_vitrine: p.estoque_vitrine,   
            validade: p.validade || '',
            estoque_infinito: p.estoque_infinito == 1 || p.estoque_infinito == true,
            imagem_path_banco: p.imagem_path, imagem_arquivo_raw: null
        };
        categoria_selecionada.value = LISTA_CATEGORIAS.includes(p.categoria) ? p.categoria : 'Outros';
        usa_balanca.value = (p.codigo_balanca && p.codigo_balanca > 0);
    } else {
        form.value = { 
            id: '', tipo_item: 'REVENDA', nome: '', 
            codigo_barras: '', codigo_balanca: '', 
            unidade_medida: 'UN', preco_custo: '', preco_venda: '', 
            estoque_deposito: '', estoque_vitrine: '', 
            validade: '', estoque_infinito: false,
            imagem_path_banco: null, imagem_arquivo_raw: null
        };
        categoria_selecionada.value = 'Outros';
        usa_balanca.value = false;
    }
};

watch(() => form.value.unidade_medida, (novaUnidade) => {
    if (!['KG', 'L'].includes(novaUnidade)) usa_balanca.value = false;
});

onMounted(preencher_form);
watch(() => props.produtoEdicao, preencher_form);

const submeter_form = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    let formData = new FormData();
    formData.append('loja_id', lojaId);
    
    formData.append('tipo_item', form.value.tipo_item);
    formData.append('nome', form.value.nome);
    formData.append('unidade_medida', form.value.unidade_medida);
    formData.append('categoria', categoria_selecionada.value);
    
    if(form.value.id) formData.append('id', form.value.id);
    
    if(usa_balanca.value && form.value.codigo_balanca) {
        formData.append('codigo_balanca', form.value.codigo_balanca);
        formData.append('codigo_barras', ''); 
    } else {
        if(form.value.codigo_barras) formData.append('codigo_barras', form.value.codigo_barras);
        formData.append('codigo_balanca', '');
    }

    if (form.value.imagem_arquivo_raw) {
        formData.append('imagem_arquivo', form.value.imagem_arquivo_raw);
    }

    if (form.value.tipo_item !== 'INTERNO') {
        formData.append('preco_custo', form.value.preco_custo || 0);
        formData.append('preco_venda', form.value.preco_venda || 0);
        formData.append('estoque_deposito', form.value.estoque_deposito || 0);
        formData.append('estoque_vitrine', form.value.estoque_vitrine || 0);
        if(form.value.validade) formData.append('validade', form.value.validade);
        formData.append('estoque_infinito', form.value.estoque_infinito ? '1' : '0');
    }

    try {
        let url = 'http://127.0.0.1:8000/api/produtos';
        if (props.produtoEdicao) {
            url += `/${form.value.id}`;
            formData.append('_method', 'PUT'); 
        }
        await axios.post(url, formData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}`, 'Content-Type': 'multipart/form-data' }
        });
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

/* SELEÇÃO DE TIPO */
.nav_tipos { display: flex; gap: 10px; margin-bottom: 20px; }
.card_radio { flex: 1; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-secondary); background: var(--bg-page); }
.card_radio:hover { border-color: var(--primary-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.card_radio.selecionado { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); color: var(--primary-color); font-weight: bold; transform: translateY(-2px); }
.card_radio input { display: none; }
.card_radio span { font-size: 15px; }
.card_radio .tip { font-size: 11px; margin-top: 2px; opacity: 0.8; }

/* LAYOUT NOVO (MAIS COMPACTO) */
.layout_identificacao {
    display: grid;
    /* Coluna da esquerda fixa 150px, coluna direita ocupa o resto */
    grid-template-columns: 150px 1fr; 
    gap: 20px;
    align-items: start;
}

.coluna_imagem {
    /* Centraliza a imagem na coluna dela */
    display: flex; 
    justify-content: center; 
}

/* GRADE DOS CAMPOS À DIREITA */
.grid_compacto {
    display: flex;
    gap: 15px;
    flex-wrap: wrap; /* Permite quebrar se a tela for pequena */
}

.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; }

/* Ajuste Balança */
.flex_balanca { display: flex; gap: 5px; align-items: center; }
.check_balanca { padding-top: 5px; cursor: pointer; }
.destaque_balanca { background-color: #fffbeb !important; border-color: #fcd34d !important; color: #b45309 !important; font-weight: bold; }

.area_botoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; pt: 15px; border-top: 1px solid var(--border-color); padding-top: 15px; }
.botao_salvar { background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px; }
.botao_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 12px 25px; border-radius: 6px; cursor: pointer; color: var(--text-primary); }

/* Responsivo */
@media (max-width: 768px) {
    .layout_identificacao { grid-template-columns: 1fr; }
    .coluna_imagem { margin: 0 auto 15px auto; width: 100%; justify-content: center; }
    .grid_compacto { flex-direction: column; gap: 10px; } 
}
</style>