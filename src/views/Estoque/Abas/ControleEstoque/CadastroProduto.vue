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
                <label>Código Interno</label>
                <input type="number" v-model="form.id" :disabled="!!produtoEdicao" placeholder="Automático" class="input_padrao">
            </div>
            <div class="grupo_input">
                <label>EAN (Código de Barras)</label>
                <input type="text" v-model="form.codigo_barras" class="input_padrao">
            </div>
        </div>

        <div class="grupo_input">
            <label>Nome do Produto *</label>
            <input type="text" v-model="form.nome" required class="input_padrao">
        </div>

        <div class="linha_dupla">
            <div class="grupo_input">
                <label>Categoria *</label>
                <select v-model="categoria_selecionada" class="input_padrao" required>
                    <option value="" disabled>Selecione...</option>
                    <option v-for="cat in LISTA_CATEGORIAS" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <div class="grupo_input">
                <label>Unidade *</label>
                <select v-model="form.unidade_medida" required class="input_padrao">
                    <option v-for="u in LISTA_UNIDADES" :key="u.codigo" :value="u.codigo">{{ u.nome }}</option>
                </select>
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
    </div>

    <div v-if="form.tipo_item === 'INTERNO'" class="secao_form destaque_info">
        <h3 class="subtitulo_form">3. Configuração de Produção</h3>
        <div class="box_aviso_producao">
            <p><strong>Este é um produto de Fabricação Própria.</strong></p>
            <ul>
                <li>💰 <strong>Custo:</strong> Será calculado na Ficha Técnica (Ingredientes + Mão de Obra).</li>
                <li>🏷️ <strong>Venda:</strong> Será definido na aba Precificação.</li>
                <li>📦 <strong>Estoque:</strong> Será alimentado pelas Ordens de Produção.</li>
            </ul>
            <p style="margin-top: 10px; font-size: 13px;">Clique em "Salvar" para cadastrar a identificação e prossiga para a aba <strong>Ficha Técnica</strong>.</p>
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

const LISTA_UNIDADES = [{ codigo: 'UN', nome: 'Unidade' }, { codigo: 'KG', nome: 'Kg' }, { codigo: 'L', nome: 'Litro' }, { codigo: 'CX', nome: 'Caixa' }];
const LISTA_CATEGORIAS = ["Panificação", "Confeitaria", "Bebidas", "Frios", "Insumos", "Outros"];

const categoria_selecionada = ref('Outros');
const form = ref({
    id: '', tipo_item: 'REVENDA', nome: '', codigo_barras: '', unidade_medida: 'UN', 
    preco_custo: '', preco_venda: '', 
    estoque_deposito: '', estoque_vitrine: '', 
    validade: ''
});

const preencher_form = () => {
    if (props.produtoEdicao) {
        const p = props.produtoEdicao;
        form.value = {
            id: p.id, tipo_item: p.tipo_item, nome: p.nome, codigo_barras: p.codigo_barras, unidade_medida: p.unidade_medida,
            preco_custo: p.preco_custo, preco_venda: p.preco_venda,
            estoque_deposito: p.estoque_deposito, 
            estoque_vitrine: p.estoque_vitrine,   
            validade: p.validade || ''
        };
        categoria_selecionada.value = LISTA_CATEGORIAS.includes(p.categoria) ? p.categoria : 'Outros';
    } else {
        // Reset
        form.value = { id: '', tipo_item: 'REVENDA', nome: '', codigo_barras: '', unidade_medida: 'UN', preco_custo: '', preco_venda: '', estoque_deposito: '', estoque_vitrine: '', validade: '' };
        categoria_selecionada.value = 'Outros';
    }
};

onMounted(preencher_form);
watch(() => props.produtoEdicao, preencher_form);

const submeter_form = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    const payload = { 
        ...form.value, 
        categoria: categoria_selecionada.value, 
        loja_id: lojaId,
        // Garante envio de números
        preco_custo: form.value.preco_custo || 0,
        preco_venda: form.value.preco_venda || 0,
        estoque_deposito: form.value.estoque_deposito || 0,
        estoque_vitrine: form.value.estoque_vitrine || 0,
        validade: form.value.validade || null
    };

    // Força limpeza explicita para INTERNO
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
.modo_edicao { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 10px; }
.header_form h4 { margin: 0 0 15px 0; color: var(--primary-color); border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.secao_form { margin-bottom: 20px; border-bottom: 1px dashed var(--border-color); padding-bottom: 10px; }
.subtitulo_form { color: var(--primary-color); font-size: 14px; margin-bottom: 10px; font-weight: bold; }
.grupo_input { margin-bottom: 10px; }
.grupo_input label { display: block; margin-bottom: 4px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 8px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 6px; }
.linha_dupla, .linha_tripla { display: grid; gap: 15px; margin-bottom: 10px; }
.linha_dupla { grid-template-columns: 1fr 1fr; }
.linha_tripla { grid-template-columns: 1fr 1fr 1fr; }

.grupo_radio_tipos { display: flex; gap: 10px; }
.card_radio { flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; }
.card_radio span { font-weight: 600; font-size: 14px; color: var(--text-primary); }
.card_radio .tip { font-size: 10px; color: var(--text-secondary); margin-top: 4px; }
.card_radio:hover { border-color: var(--primary-color); }
.card_radio.selecionado { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); color: var(--primary-color); font-weight: bold; }
.card_radio input { display: none; }

.area_botoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
.botao_salvar { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.botao_cancelar { background: transparent; border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 6px; cursor: pointer; }

/* Destaques Específicos */
.destaque_vitrine { border-color: #f59e0b; background-color: #fffbeb; }
.box_aviso_producao { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 6px; color: #0369a1; font-size: 14px; }
.box_aviso_producao ul { margin: 10px 0 0 20px; padding: 0; }
.box_aviso_producao li { margin-bottom: 5px; }
</style>