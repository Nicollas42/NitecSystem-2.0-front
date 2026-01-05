<template>
  <form @submit.prevent="submeter_form" class="form_cadastro" :class="{ 'modo_edicao': !!produtoEdicao }">
    
    <div class="header_form" v-if="produtoEdicao">
        <h4>Editando: {{ produtoEdicao.nome }}</h4>
    </div>

    <div class="secao_form">
        <h3 class="subtitulo_form">1. Classificação</h3>
        <div class="grupo_radio_tipos">
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
                <small class="tip">Fabricação Própria</small>
            </label>
        </div>
    </div>

    <div class="secao_form">
        <h3 class="subtitulo_form">2. Identificação</h3>
        
        <div class="linha_dupla">
            <div class="grupo_input">
                <label>Nome do Produto *</label>
                <input type="text" v-model="form.nome" required class="input_padrao">
            </div>
            
            <div class="grupo_input">
                <label>Unidade *</label>
                <select v-model="form.unidade_medida" required class="input_padrao">
                    <option v-for="u in LISTA_UNIDADES" :key="u.codigo" :value="u.codigo">{{ u.nome }}</option>
                </select>
                
                <div v-if="['KG', 'L'].includes(form.unidade_medida)" class="checkbox_balanca">
                    <input type="checkbox" id="chk_balanca" v-model="usa_balanca">
                    <label for="chk_balanca" style="cursor: pointer; color: var(--primary-color); font-weight: bold;">
                        ⚖️ Este produto é pesado no caixa?
                    </label>
                </div>
            </div>
        </div>

        <div class="linha_id_cat_ean">
            
            <div class="grupo_input">
                <label>ID Interno</label>
                <input type="number" v-model="form.id" :disabled="!!produtoEdicao" placeholder="Auto" class="input_padrao">
            </div>

            <div class="grupo_input">
                <label>Categoria *</label>
                <select v-model="categoria_selecionada" class="input_padrao" required>
                    <option value="" disabled>Selecione...</option>
                    <option v-for="cat in LISTA_CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>

            <div class="grupo_input" v-if="usa_balanca && ['KG', 'L'].includes(form.unidade_medida)">
                <label style="color: #d97706; font-weight: bold;">⚖️ Cód. na Balança (Ex: 50)</label>
                <input type="number" v-model="form.codigo_balanca" class="input_padrao destaque_balanca" placeholder="Digito da Balança">
            </div>
            
            <div class="grupo_input" v-else>
                <label>EAN (Código de Barras)</label>
                <input type="text" v-model="form.codigo_barras" class="input_padrao" placeholder="Leitor...">
            </div>
        </div>
    </div>

    <div v-if="form.tipo_item === 'REVENDA'" class="secao_form destaque_financeiro">
        <h3 class="subtitulo_form">3. Valores & Estoque (Loja Atual)</h3>
        
        <div class="linha_dupla">
            <div class="grupo_input">
                <label>Preço Custo</label>
                <input type="number" step="0.01" v-model="form.preco_custo" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>Preço Venda *</label>
                <input type="number" step="0.01" v-model="form.preco_venda" required class="input_padrao">
            </div>
        </div>

        <div class="linha_tripla">
            <div class="grupo_input">
                <label>📦 Depósito</label>
                <input type="number" step="0.001" v-model="form.estoque_deposito" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>🏪 Vitrine (Loja)</label>
                <input type="number" step="0.001" v-model="form.estoque_vitrine" class="input_padrao destaque_vitrine">
            </div>
            <div class="grupo_input">
                <label>Validade</label>
                <input type="date" v-model="form.validade" class="input_padrao">
            </div>
        </div>
    </div>

    <div v-if="form.tipo_item === 'INSUMOS'" class="secao_form destaque_financeiro">
        <h3 class="subtitulo_form">3. Estoque de Insumo</h3>
        <div class="linha_tripla">
            <div class="grupo_input">
                <label>Preço Custo</label>
                <input type="number" step="0.01" v-model="form.preco_custo" class="input_padrao" placeholder="Custo de Compra">
            </div>
            <div class="grupo_input">
                <label>📦 Estoque Depósito</label>
                <input type="number" step="0.001" v-model="form.estoque_deposito" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>Validade</label>
                <input type="date" v-model="form.validade" class="input_padrao">
            </div>
        </div>
        <p class="aviso_info">ℹ️ Insumos não possuem preço de venda direta.</p>
    </div>

    <div v-if="form.tipo_item === 'INTERNO'" class="secao_form destaque_info">
        <h3 class="subtitulo_form">3. Configuração de Produção</h3>
        <div class="box_aviso_producao">
            <p><strong>Este é um produto de Fabricação Própria.</strong></p>
            <ul>
                <li>💰 <strong>Custo:</strong> Será calculado na Ficha Técnica.</li>
                <li>🏷️ <strong>Venda:</strong> Definido na Precificação.</li>
                <li>📦 <strong>Estoque:</strong> Alimentado por Produção.</li>
            </ul>
        </div>
    </div>

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

const props = defineProps({ produtoEdicao: Object });
const emit = defineEmits(['salvo', 'cancelar']);

const LISTA_UNIDADES = [{ codigo: 'UN', nome: 'Unidade' }, { codigo: 'KG', nome: 'Quilograma' }, { codigo: 'L', nome: 'Litro' }, { codigo: 'CX', nome: 'Caixa' }];
const LISTA_CATEGORIAS = ["Panificação", "Confeitaria", "Bebidas", "Frios", "Insumos", "Outros"];

const categoria_selecionada = ref('Outros');
const usa_balanca = ref(false);

const form = ref({
    id: '', tipo_item: 'REVENDA', nome: '', 
    codigo_barras: '', 
    codigo_balanca: '', 
    unidade_medida: 'UN', 
    preco_custo: '', preco_venda: '', 
    estoque_deposito: '', estoque_vitrine: '', 
    validade: ''
});

const preencher_form = () => {
    if (props.produtoEdicao) {
        const p = props.produtoEdicao;
        form.value = {
            id: p.id, tipo_item: p.tipo_item, nome: p.nome, 
            codigo_barras: p.codigo_barras, 
            codigo_balanca: p.codigo_balanca, 
            unidade_medida: p.unidade_medida,
            preco_custo: p.preco_custo, preco_venda: p.preco_venda,
            estoque_deposito: p.estoque_deposito, 
            estoque_vitrine: p.estoque_vitrine,   
            validade: p.validade || ''
        };
        categoria_selecionada.value = LISTA_CATEGORIAS.includes(p.categoria) ? p.categoria : 'Outros';
        
        // Verifica se já usa balança
        if (p.codigo_balanca && p.codigo_balanca > 0) {
            usa_balanca.value = true;
        } else {
            usa_balanca.value = false;
        }

    } else {
        // Reset
        form.value = { id: '', tipo_item: 'REVENDA', nome: '', codigo_barras: '', codigo_balanca: '', unidade_medida: 'UN', preco_custo: '', preco_venda: '', estoque_deposito: '', estoque_vitrine: '', validade: '' };
        categoria_selecionada.value = 'Outros';
        usa_balanca.value = false;
    }
};

// Reseta balança se não for KG/L
watch(() => form.value.unidade_medida, (novaUnidade) => {
    if (!['KG', 'L'].includes(novaUnidade)) {
        usa_balanca.value = false;
    }
});

onMounted(preencher_form);
watch(() => props.produtoEdicao, preencher_form);

const submeter_form = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    const payload = { 
        ...form.value, 
        categoria: categoria_selecionada.value, 
        loja_id: lojaId,
        preco_custo: form.value.preco_custo || 0,
        preco_venda: form.value.preco_venda || 0,
        estoque_deposito: form.value.estoque_deposito || 0,
        estoque_vitrine: form.value.estoque_vitrine || 0,
        validade: form.value.validade || null,
        
        // Se usa balança, manda cod_balanca e anula EAN (opcional, depende da regra)
        codigo_balanca: usa_balanca.value ? form.value.codigo_balanca : null,
        codigo_barras: !usa_balanca.value ? form.value.codigo_barras : null
    };

    if (form.value.tipo_item === 'INTERNO') {
        payload.preco_custo = 0;
        payload.preco_venda = 0;
        payload.estoque_deposito = 0;
        payload.estoque_vitrine = 0;
        payload.validade = null;
    }

    try {
        const url = 'http://127.0.0.1:8000/api/produtos';
        if (props.produtoEdicao) {
            await axios.put(`${url}/${form.value.id}`, payload, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` } });
        } else {
            await axios.post(url, payload, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` } });
        }
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
.secao_form { margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 10px; font-weight: bold; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; }

/* LAYOUT DE GRIDS */
.linha_dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
.linha_tripla { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 10px; }

/* LINHA PERSONALIZADA: ID (100px) | CATEGORIA (Auto) | EAN (Auto) */
.linha_id_cat_ean { 
    display: grid; 
    grid-template-columns: 100px 1fr 1fr; 
    gap: 15px; 
    margin-bottom: 10px; 
}

.grupo_radio_tipos { display: flex; gap: 10px; }
.card_radio { flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-secondary); }
.card_radio:hover { border-color: var(--primary-color); }
.card_radio.selecionado { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); color: var(--primary-color); font-weight: bold; }
.card_radio input { display: none; }

.area_botoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
.botao_salvar { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.botao_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 6px; cursor: pointer; color: var(--text-primary); }

.checkbox_balanca { margin-top: 8px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
.destaque_balanca { background-color: var(--highlight-bg) !important; color: var(--highlight-text) !important; border-color: var(--highlight-border) !important; }
.destaque_vitrine { background-color: var(--highlight-bg) !important; color: var(--highlight-text) !important; border-color: var(--highlight-border) !important; }

.aviso_info { font-size: 12px; color: var(--text-secondary); margin-top: 5px; font-style: italic; }
.box_aviso_producao { padding: 15px; border-radius: 6px; font-size: 14px; }
</style>