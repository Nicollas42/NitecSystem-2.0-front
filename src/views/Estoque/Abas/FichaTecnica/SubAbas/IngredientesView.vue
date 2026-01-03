<template>
  <div>
    <h3 class="titulo_sub">Ingredientes (Composição)</h3>
    <p class="desc">Selecione os insumos do estoque usados nesta receita.</p>
    
    <div class="box_adicionar">
        <div class="linha_add">
            <div class="grupo_input" style="flex: 2;">
                <label>Insumo (Estoque)</label>
                <select v-model="ingrediente_temp.id" class="input_padrao" @change="selecionar_insumo">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="insumo in lista_insumos" :key="insumo.id" :value="insumo.id">
                        {{ insumo.nome }} ({{ insumo.unidade_medida }}) - R$ {{ formatar_valor(insumo.preco_custo) }}
                    </option>
                </select>
            </div>
            
            <div class="grupo_input" style="flex: 1;">
                <label>Qtd. Usada</label>
                <input type="number" step="0.001" v-model="ingrediente_temp.qtd" class="input_padrao" placeholder="Ex: 0.500">
            </div>

            <div class="grupo_input" style="flex: 1;">
                <label>Custo Calc.</label>
                <div class="display_valor">R$ {{ custo_proporcional }}</div>
            </div>

            <button class="botao_add" @click="adicionar_na_lista" :disabled="!ingrediente_temp.id || !ingrediente_temp.qtd">
                ➕ Adicionar
            </button>
        </div>
    </div>

    <div class="tabela_simples">
        <div class="cabecalho_tabela">
            <span>Insumo</span>
            <span>Qtd. Usada</span>
            <span>Custo Unit.</span>
            <span>Subtotal</span>
            <span>Ação</span>
        </div>
        
        <div v-for="(item, index) in ingredientes_da_receita" :key="index" class="linha_tabela">
            <span>{{ item.nome }}</span>
            <span>{{ item.qtd }} {{ item.unidade }}</span>
            <span>R$ {{ formatar_valor(item.custo_unitario) }}</span>
            <span style="font-weight: bold; color: #10b981;">R$ {{ formatar_valor(item.subtotal) }}</span>
            <button class="btn_del" @click="remover_item(index)">🗑️</button>
        </div>

        <div v-if="ingredientes_da_receita.length === 0" class="aviso_tabela">
            Nenhum ingrediente adicionado.
        </div>
    </div>

    <div class="resumo_total">
        Total Ingredientes: <strong>R$ {{ formatar_valor(total_ingredientes) }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Estado
const lista_insumos = ref([]); // Vem da API (filtrado por INSUMOS)
const ingredientes_da_receita = ref([]); // Lista local da ficha técnica

const ingrediente_temp = ref({
    id: '',
    nome: '',
    unidade: '',
    custo_unitario: 0,
    qtd: ''
});

// --- API ---
const carregar_insumos = async () => {
    try {
        // Na vida real você criaria uma rota na API: /api/produtos?tipo=INSUMOS
        // Aqui vou simular pegando todos e filtrando no front por enquanto
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        lista_insumos.value = res.data.filter(p => p.tipo_item === 'INSUMOS');
    } catch (e) {
        console.error("Erro ao buscar insumos", e);
    }
};

// --- LÓGICA ---
const selecionar_insumo = () => {
    const selecionado = lista_insumos.value.find(i => i.id === ingrediente_temp.value.id);
    if (selecionado) {
        ingrediente_temp.value.nome = selecionado.nome;
        ingrediente_temp.value.unidade = selecionado.unidade_medida;
        ingrediente_temp.value.custo_unitario = Number(selecionado.preco_custo);
    }
};

const custo_proporcional = computed(() => {
    const custo = ingrediente_temp.value.custo_unitario;
    const qtd = parseFloat(ingrediente_temp.value.qtd) || 0;
    // Cálculo simples: Preço Kg * Qtd Kg
    return (custo * qtd).toFixed(2);
});

const total_ingredientes = computed(() => {
    return ingredientes_da_receita.value.reduce((acc, item) => acc + item.subtotal, 0);
});

const adicionar_na_lista = () => {
    ingredientes_da_receita.value.push({
        id: ingrediente_temp.value.id,
        nome: ingrediente_temp.value.nome,
        unidade: ingrediente_temp.value.unidade,
        custo_unitario: ingrediente_temp.value.custo_unitario,
        qtd: parseFloat(ingrediente_temp.value.qtd),
        subtotal: parseFloat(custo_proporcional.value)
    });
    
    // Limpa apenas qtd e id
    ingrediente_temp.value.id = '';
    ingrediente_temp.value.qtd = '';
    ingrediente_temp.value.custo_unitario = 0;
};

const remover_item = (index) => {
    ingredientes_da_receita.value.splice(index, 1);
};

const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

onMounted(carregar_insumos);
</script>

<style scoped>
.box_adicionar { background: var(--bg-page); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border-color); }
.linha_add { display: flex; gap: 15px; align-items: flex-end; }
.display_valor { padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; font-weight: bold; }
.botao_add { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; height: 42px; font-weight: bold; }
.botao_add:disabled { opacity: 0.5; cursor: not-allowed; }

.tabela_simples { border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; margin-bottom: 15px; }
.cabecalho_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr; padding: 10px; background: var(--bg-page); font-weight: bold; color: var(--text-secondary); }
.linha_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr; padding: 10px; border-top: 1px solid var(--border-color); color: var(--text-primary); align-items: center; }
.btn_del { background: none; border: none; cursor: pointer; filter: grayscale(1); }
.btn_del:hover { filter: none; }
.resumo_total { text-align: right; font-size: 18px; color: var(--text-primary); padding: 10px; }
.aviso_tabela { padding: 20px; text-align: center; color: var(--text-secondary); }
.grupo_input label { display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 13px; }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
</style>