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

const dados_ficha = reactive({
    ingredientes: [], maquinas: [], total_ingredientes: 0, total_operacional: 0
});

const carregar_produtos_internos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await axios.get('http://127.0.0.1:8000/api/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId } // <--- Importante para pegar contexto
        });
        lista_produtos_internos.value = res.data.filter(p => p.tipo_item === 'INTERNO');
    } catch (e) { console.error(e); }
};

// ... Resto das funções iguais ...
const carregar_dados_produto = () => {
    dados_ficha.ingredientes = [];
    dados_ficha.maquinas = [];
    dados_ficha.total_ingredientes = 0;
    dados_ficha.total_operacional = 0;
};

onMounted(carregar_produtos_internos);
</script>

<style scoped>
/* (Seus estilos aqui) */
.container_ficha { background: var(--bg-card); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
.navegacao_sub { display: flex; gap: 5px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
.aba_sub { background: none; border: none; padding: 10px 15px; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; }
.aba_sub.ativo { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }
</style>