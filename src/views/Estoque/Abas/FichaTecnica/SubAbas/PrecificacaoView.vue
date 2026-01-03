<template>
  <div>
    <h3 class="titulo_sub">Fechamento de Custos</h3>

    <div class="grid_resumo">
        <div class="card_resumo">
            <span>Matéria Prima</span>
            <strong>R$ {{ custo_ingredientes.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo">
            <span>Operacional (Gás/Luz/Deprec.)</span>
            <strong>R$ {{ custo_operacional.toFixed(2) }}</strong>
        </div>
        <div class="card_resumo total">
            <span>CUSTO TOTAL</span>
            <strong>R$ {{ custo_total.toFixed(2) }}</strong>
        </div>
    </div>

    <div class="form_preco">
        <h4 style="grid-column: span 2; color: var(--text-primary);">Formação de Preço</h4>

        <div class="grupo">
            <label>Margem de Lucro Desejada (%)</label>
            <input type="number" v-model="margem_lucro" class="input_padrao">
        </div>

        <div class="grupo">
            <label>Imposto na Venda (%)</label>
            <input type="number" v-model="imposto_venda" class="input_padrao" placeholder="Ex: 4.5 (Simples)">
        </div>

        <div class="grupo destaque">
            <label>Preço Sugerido (Calc.)</label>
            <div class="preco_sugerido">R$ {{ preco_sugerido }}</div>
            <small class="ajuda">Custo + Margem + Imposto</small>
        </div>

        <div class="grupo">
            <label>Preço de Venda REAL</label>
            <input type="number" step="0.01" v-model="preco_venda_real" class="input_padrao input_real">
        </div>
    </div>

    <button class="botao_salvar" @click="salvar_ficha_produto">💾 Salvar Preço no Produto</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps(['produto_id', 'custo_ingredientes', 'custo_operacional']);

const margem_lucro = ref(100); // 100% de margem padrão
const imposto_venda = ref(0);  // 0% padrão
const preco_venda_real = ref(0);

const custo_total = computed(() => props.custo_ingredientes + props.custo_operacional);

// FÓRMULA DE PRECIFICAÇÃO ROBUSTA
// Preço = (Custo * (1 + Margem%)) / (1 - Imposto%)
// Ex: Custo 10, Margem 50% (vira 15). Imposto 10%. Venda = 15 / 0.9 = 16.66
const preco_sugerido = computed(() => {
    if (custo_total.value === 0) return "0.00";
    
    const base_com_lucro = custo_total.value * (1 + (margem_lucro.value / 100));
    const divisor_imposto = 1 - (imposto_venda.value / 100);
    
    if (divisor_imposto <= 0) return "Erro"; // Evita divisão por zero

    return (base_com_lucro / divisor_imposto).toFixed(2);
});

const salvar_ficha_produto = async () => {
    if (!props.produto_id) return alert('Selecione um produto!');
    if (preco_venda_real.value <= 0) return alert('Defina um preço de venda real!');

    try {
        // Atualiza o produto com o novo custo calculado e preço de venda
        await axios.put(`http://127.0.0.1:8000/api/produtos/${props.produto_id}`, {
            preco_custo: custo_total.value, // Salva o custo calculado na ficha
            preco_venda: preco_venda_real.value,
            // Poderíamos salvar margem e imposto se tivéssemos colunas para isso
        }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });

        alert('Preço e Custo atualizados no cadastro do Produto!');
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
.preco_sugerido { font-size: 24px; font-weight: bold; color: #fbbf24; padding: 10px 0; }
.input_real { border-color: #10b981; color: #10b981; font-weight: bold; }
.ajuda { font-size: 11px; color: var(--text-secondary); }

.botao_salvar { width: 100%; background: var(--primary-color); color: white; border: none; padding: 15px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 16px; }
.botao_salvar:hover { opacity: 0.9; }
</style>