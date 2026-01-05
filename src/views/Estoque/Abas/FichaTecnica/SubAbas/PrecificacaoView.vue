<template>
  <div>
    <h3 class="titulo_sub">Fechamento de Custos</h3>

    <div class="grid_resumo">
        <div class="card_resumo">
            <span>Matéria Prima (Total)</span>
            <strong>R$ {{ custo_ingredientes.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo">
            <span>Operacional (Total)</span>
            <strong>R$ {{ custo_operacional.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo total">
            <span>CUSTO RECEITA</span>
            <strong>R$ {{ custo_total_receita.toFixed(2) }}</strong>
        </div>
    </div>

    <div class="form_preco">
        <h4 style="grid-column: span 2; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px;">
            1. Definição de Rendimento
        </h4>

        <div class="grupo" style="grid-column: span 2;">
            <label>Rendimento da Receita (Qtd. Unidades/Kg Produzidos) *</label>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" step="0.001" v-model="rendimento" class="input_padrao destaque_rendimento" placeholder="Ex: 200 (Unidades) ou 5.5 (Kg)">
                <span style="font-weight: bold; color: var(--text-secondary);"> = </span>
                <div class="card_unitario">
                    <span>Custo UNITÁRIO:</span>
                    <strong>R$ {{ custo_unitario }}</strong>
                </div>
            </div>
            <small class="ajuda">Informe quanto essa receita rende para calcular o custo de 1 unidade.</small>
        </div>

        <h4 style="grid-column: span 2; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px; margin-top: 10px;">
            2. Formação de Preço (Unitário)
        </h4>

        <div class="grupo">
            <label>Margem de Lucro Desejada (%)</label>
            <input type="number" v-model="margem_lucro" class="input_padrao">
        </div>

        <div class="grupo">
            <label>Imposto na Venda (%)</label>
            <input type="number" v-model="imposto_venda" class="input_padrao" placeholder="Ex: 4.5">
        </div>

        <div class="grupo destaque">
            <label>Preço Sugerido (Calc.)</label>
            <div class="preco_sugerido">R$ {{ preco_sugerido }}</div>
            <div class="detalhe_imposto" v-if="valor_imposto_estimado > 0">
                (Imposto est.: R$ {{ valor_imposto_estimado }})
            </div>
        </div>

        <div class="grupo">
            <label>Preço de Venda REAL</label>
            <input type="number" step="0.01" v-model="preco_venda_real" class="input_padrao input_real">
        </div>
    </div>

    <button class="botao_salvar" @click="salvar_ficha_produto">💾 Salvar Ficha e Atualizar Estoque</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps(['produto_id', 'custo_ingredientes', 'custo_operacional']);

const margem_lucro = ref(100); 
const imposto_venda = ref(0); // Ex: 10%
const preco_venda_real = ref(0);
const rendimento = ref(1); // Padrão 1 para não dividir por zero

// Carregar dados atuais do produto (Rendimento salvo anteriormente)
const carregar_dados_produto = async () => {
    if (!props.produto_id) return;
    const lojaId = localStorage.getItem('loja_ativa_id');
    
    try {
        // Precisamos buscar o produto específico para pegar o 'rendimento' salvo no banco
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        
        const produto = res.data.find(p => p.id === props.produto_id);
        if (produto) {
            rendimento.value = parseFloat(produto.rendimento) || 1;
            preco_venda_real.value = parseFloat(produto.preco_venda) || 0;
            // Se tivesse campos margem/imposto no banco, carregaria aqui também
        }
    } catch (e) { console.error(e); }
};

// Monitora mudança de produto para recarregar rendimento
watch(() => props.produto_id, carregar_dados_produto);
onMounted(carregar_dados_produto);

// 1. Custo Total da Receita
const custo_total_receita = computed(() => props.custo_ingredientes + props.custo_operacional);

// 2. Custo Unitário (Base para o preço)
const custo_unitario = computed(() => {
    const r = parseFloat(rendimento.value);
    if (!r || r <= 0) return "0.00";
    return (custo_total_receita.value / r).toFixed(2);
});

// 3. Cálculos de Preço
const preco_base_com_margem = computed(() => {
    const custo = parseFloat(custo_unitario.value);
    return custo * (1 + (margem_lucro.value / 100));
});

const preco_sugerido = computed(() => {
    const base = preco_base_com_margem.value;
    const divisor_imposto = 1 - (imposto_venda.value / 100);
    if (divisor_imposto <= 0) return "Erro";
    return (base / divisor_imposto).toFixed(2);
});

const valor_imposto_estimado = computed(() => {
    const preco = parseFloat(preco_sugerido.value);
    if (isNaN(preco)) return "0.00";
    return (preco * (imposto_venda.value / 100)).toFixed(2);
});

// Ação de Salvar
const salvar_ficha_produto = async () => {
    if (!props.produto_id) return alert('Selecione um produto!');
    if (preco_venda_real.value <= 0) return alert('Defina um preço de venda real!');
    if (rendimento.value <= 0) return alert('O rendimento deve ser maior que 0!');

    const lojaId = localStorage.getItem('loja_ativa_id');

    try {
        await axios.put(`http://127.0.0.1:8000/api/produtos/${props.produto_id}`, {
            loja_id: lojaId,
            
            // Dados Globais do Produto
            tipo_item: 'INTERNO',
            rendimento: rendimento.value, // Salva o rendimento na tabela produtos
            
            // Dados de Estoque (Valores Unitários)
            preco_custo: custo_unitario.value, // Salva o custo UNITÁRIO calculado
            preco_venda: preco_venda_real.value, // Salva o preço de venda definido
            
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });

        alert(`Sucesso!\n\nEstoque Atualizado:\nCusto Unitário: R$ ${custo_unitario.value}\nVenda Unitária: R$ ${preco_venda_real.value}`);
        
    } catch (e) {
        console.error(e);
        alert('Erro ao salvar.');
    }
};
</script>

<style scoped>
.titulo_sub { color: var(--primary-color); margin-bottom: 20px; }
.grid_resumo { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px; }
.card_resumo { background: var(--bg-page); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; text-align: center; }
.card_resumo span { font-size: 13px; color: var(--text-secondary); margin-bottom: 5px; }
.card_resumo strong { font-size: 20px; color: var(--text-primary); }
.card_resumo.total { border-color: var(--primary-color); background: rgba(59, 130, 246, 0.1); }
.card_resumo.total strong { color: var(--primary-color); }

.form_preco { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: var(--bg-page); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px; }
.grupo label { display: block; color: var(--text-secondary); margin-bottom: 5px; font-size: 14px; }
.input_padrao { width: 100%; padding: 12px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; font-size: 16px; }

/* Estilos Específicos */
.destaque_rendimento { border-color: var(--primary-color); color: var(--primary-color); font-weight: bold; width: 150px !important; }
.card_unitario { background: var(--bg-card); border: 2px solid #10b981; padding: 10px 20px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; margin-left: auto; }
.card_unitario span { font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase; }
.card_unitario strong { font-size: 18px; color: var(--text-primary); }

.preco_sugerido { font-size: 24px; font-weight: bold; color: #fbbf24; padding: 5px 0; }
.detalhe_imposto { font-size: 12px; color: var(--text-secondary); font-style: italic; }
.input_real { border-color: #10b981; color: #10b981; font-weight: bold; font-size: 20px; }
.ajuda { font-size: 11px; color: var(--text-secondary); margin-top: 5px; display: block; }

.botao_salvar { width: 100%; background: var(--primary-color); color: white; border: none; padding: 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px; }
.botao_salvar:hover { opacity: 0.9; }
</style>