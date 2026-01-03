<template>
  <div class="container_ficha">
    
    <div class="selecao_produto">
        <label>Selecione o Produto para editar a Ficha:</label>
        <select v-model="produto_id" class="input_padrao" @change="carregar_dados_produto">
            <option value="" disabled>Selecione um produto de fabricação própria...</option>
            <option v-for="prod in lista_produtos_internos" :key="prod.id" :value="prod.id">
                #{{ prod.id }} - {{ prod.nome }}
            </option>
        </select>
    </div>

    <div v-if="produto_id">
        <div class="navegacao_sub">
            <button :class="['aba_sub', { ativo: sub_aba === 'ingredientes' }]" @click="sub_aba = 'ingredientes'">
                🥕 Ingredientes (R$ {{ dados_ficha.total_ingredientes.toFixed(2) }})
            </button>
            <button :class="['aba_sub', { ativo: sub_aba === 'maquinas' }]" @click="sub_aba = 'maquinas'">
                ⚙️ Máquinas (R$ {{ dados_ficha.total_operacional.toFixed(2) }})
            </button>
            <button :class="['aba_sub', { ativo: sub_aba === 'precificacao' }]" @click="sub_aba = 'precificacao'">
                💰 Precificação
            </button>
        </div>

        <div class="conteudo_ficha">
            <IngredientesView 
                v-if="sub_aba === 'ingredientes'" 
                :lista="dados_ficha.ingredientes"
                @atualizar-total="(v) => dados_ficha.total_ingredientes = v"
            />
            
            <MaquinasView 
                v-if="sub_aba === 'maquinas'" 
                :lista="dados_ficha.maquinas"
                @atualizar-total="(v) => dados_ficha.total_operacional = v"
            />
            
            <PrecificacaoView 
                v-if="sub_aba === 'precificacao'" 
                :produto_id="produto_id"
                :custo_ingredientes="dados_ficha.total_ingredientes"
                :custo_operacional="dados_ficha.total_operacional"
            />
        </div>
    </div>

    <div v-else class="aviso_selecao">
        <div style="font-size: 40px; margin-bottom: 10px;">🍞</div>
        Selecione um produto <strong>INTERNO</strong> acima.
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import IngredientesView from './SubAbas/IngredientesView.vue';
import MaquinasView from './SubAbas/MaquinasView.vue';
import PrecificacaoView from './SubAbas/PrecificacaoView.vue';

const produto_id = ref('');
const sub_aba = ref('ingredientes');
const lista_produtos_internos = ref([]);

// ESTADO CENTRALIZADO DA FICHA (Compartilhado entre abas)
const dados_ficha = reactive({
    ingredientes: [], // Lista de itens { nome, custo... }
    maquinas: [],     // Lista de uso { maquina, tempo... }
    total_ingredientes: 0,
    total_operacional: 0
});

const carregar_produtos_internos = async () => {
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` }
        });
        lista_produtos_internos.value = res.data.filter(p => p.tipo_item === 'INTERNO');
    } catch (e) { console.error(e); }
};

const carregar_dados_produto = () => {
    // Aqui futuramente buscaríamos a receita salva no banco
    // Por enquanto, reseta para começar uma nova
    dados_ficha.ingredientes = [];
    dados_ficha.maquinas = [];
    dados_ficha.total_ingredientes = 0;
    dados_ficha.total_operacional = 0;
};

onMounted(carregar_produtos_internos);
</script>

<style scoped>
.container_ficha { background: var(--bg-card); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); }
.selecao_produto { margin-bottom: 20px; }
.selecao_produto label { display: block; margin-bottom: 5px; color: var(--text-secondary); font-weight: 500; }
.navegacao_sub { display: flex; gap: 5px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
.aba_sub {
    background: none; border: none; padding: 10px 15px; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: color 0.2s;
}
.aba_sub:hover { color: var(--text-primary); }
.aba_sub.ativo { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }
.aviso_selecao { text-align: center; color: var(--text-primary); padding: 40px; border: 2px dashed var(--border-color); border-radius: 8px; background: var(--bg-page); }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
</style>