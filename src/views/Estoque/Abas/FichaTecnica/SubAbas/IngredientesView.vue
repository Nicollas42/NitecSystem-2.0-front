<template>
  <div>
    <h3 class="titulo_sub">Ingredientes (Composição)</h3>
    <p class="desc">Pesquise os insumos e defina a quantidade usada na receita.</p>
    
    <div class="box_adicionar">
        <div class="linha_add">
            
            <div class="grupo_input" style="flex: 2; position: relative;">
                <label>Pesquisar Insumo</label>
                <input 
                    type="text" 
                    v-model="termo_busca" 
                    class="input_padrao" 
                    placeholder="Nome, ID ou Código de Barras..."
                    @focus="mostrar_lista = true"
                    @blur="fechar_lista_delay"
                >
                
                <div v-if="mostrar_lista && lista_filtrada.length > 0" class="lista_resultados">
                    <div 
                        v-for="insumo in lista_filtrada" 
                        :key="insumo.id" 
                        class="item_resultado"
                        @mousedown="selecionar_insumo(insumo)"
                    >
                        <div class="info_principal">
                            <strong>{{ insumo.nome }}</strong>
                            <span :class="['tag_estoque', (Number(insumo.estoque_deposito) || 0) > 0 ? 'ok' : 'zerado']">
                                Estoque: {{ formatar_qtd(insumo.estoque_deposito) }} {{ insumo.unidade_medida }}
                            </span>
                        </div>
                        <small>Custo: R$ {{ formatar_valor(insumo.preco_custo) }} / {{ insumo.unidade_medida }}</small>
                    </div>
                </div>
                
                <div v-else-if="mostrar_lista && termo_busca && lista_filtrada.length === 0" class="lista_resultados">
                    <div class="item_resultado" style="cursor: default; color: #999;">
                        Nenhum insumo encontrado.
                    </div>
                </div>
            </div>
            
            <div class="grupo_input" style="flex: 1;">
                <label>Qtd. Usada ({{ unidade_selecionada || 'UN' }})</label>
                <input 
                    type="number" 
                    step="0.001" 
                    v-model="ingrediente_temp.qtd" 
                    class="input_padrao" 
                    :placeholder="unidade_selecionada === 'KG' ? '0.500' : '1'"
                    :disabled="!ingrediente_temp.id"
                >
            </div>

            <div class="grupo_input" style="flex: 1;">
                <label>Custo Fração</label>
                <div class="display_valor">
                    R$ {{ custo_proporcional }}
                </div>
            </div>

            <button class="botao_add" @click="adicionar_na_lista" :disabled="!ingrediente_temp.id || !ingrediente_temp.qtd">
                ➕ Add
            </button>
        </div>
        
        <div v-if="ingrediente_temp.id" class="item_selecionado_info">
            Insumo Selecionado: <strong>{{ ingrediente_temp.nome }}</strong> | Custo Base: R$ {{ formatar_valor(ingrediente_temp.custo_unitario) }} / {{ unidade_selecionada }}
        </div>
    </div>

    <div class="tabela_simples">
        <div class="cabecalho_tabela">
            <span>Insumo</span>
            <span>Qtd. Receita</span>
            <span>Custo Base</span>
            <span>Custo Fração</span>
            <span style="text-align: center;">Ação</span>
        </div>
        
        <div v-for="(item, index) in ingredientes_da_receita" :key="index" class="linha_tabela">
            <span class="texto_nome">{{ item.nome }}</span>
            <span>{{ formatar_qtd(item.qtd) }} <small class="unidade_badge">{{ item.unidade }}</small></span>
            <span style="color: var(--text-secondary); font-size: 13px;">R$ {{ formatar_valor(item.custo_unitario) }}</span>
            <span style="font-weight: bold; color: #10b981;">R$ {{ formatar_valor(item.subtotal) }}</span>
            <div style="text-align: center;">
                <button class="btn_del" @click="remover_item(index)" title="Remover">🗑️</button>
            </div>
        </div>

        <div v-if="ingredientes_da_receita.length === 0" class="aviso_tabela">
            Nenhum ingrediente adicionado à ficha técnica.
        </div>
    </div>

    <div class="resumo_total">
        Custo Total Ingredientes: <strong>R$ {{ formatar_valor(total_ingredientes) }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { api_request } from '@/services/api_helper';
import { useBuscaProduto } from '@/composables/useBuscaProduto';

const props = defineProps(['lista']); 
const emit = defineEmits(['atualizar-total']);

const lista_insumos_db = ref([]);
const unidade_selecionada = ref('');
const ingredientes_da_receita = ref([]); 
const ingrediente_temp = ref({ id: '', nome: '', unidade: '', custo_unitario: 0, qtd: '' });

// --- INTEGRAÇÃO COM COMPOSABLE ---
const { 
    termo_busca, 
    mostrar_lista, 
    lista_filtrada, 
    fechar_lista_delay,
    limpar_busca 
} = useBuscaProduto(lista_insumos_db);

const carregar_insumos = async () => {
    const lojaId = localStorage.getItem('loja_ativa_id');
    try {
        const res = await api_request('get', '/produtos', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token_erp')}` },
            params: { loja_id: lojaId }
        });
        // CORREÇÃO: Removido .data
        lista_insumos_db.value = res.filter(p => p.tipo_item === 'INSUMOS');
    } catch (e) { console.error("Erro ao buscar insumos", e); }
};

const selecionar_insumo = (item) => {
    ingrediente_temp.value.id = item.id;
    ingrediente_temp.value.nome = item.nome;
    ingrediente_temp.value.unidade = item.unidade_medida;
    ingrediente_temp.value.custo_unitario = Number(item.preco_custo);
    
    termo_busca.value = item.nome;
    unidade_selecionada.value = item.unidade_medida;
    mostrar_lista.value = false;
};

const custo_proporcional = computed(() => {
    const custo = ingrediente_temp.value.custo_unitario;
    const qtd = parseFloat(ingrediente_temp.value.qtd);
    if (!qtd || !custo) return "0.00";
    return (custo * qtd).toFixed(2);
});

const total_ingredientes = computed(() => {
    const total = ingredientes_da_receita.value.reduce((acc, item) => acc + item.subtotal, 0);
    emit('atualizar-total', total);
    return total;
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
    
    ingrediente_temp.value = { id: '', nome: '', unidade: '', custo_unitario: 0, qtd: '' };
    unidade_selecionada.value = '';
    limpar_busca();
};

const remover_item = (index) => {
    ingredientes_da_receita.value.splice(index, 1);
};

watch(() => props.lista, (novaLista) => {
    if (novaLista) ingredientes_da_receita.value = novaLista;
}, { immediate: true });

const formatar_valor = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatar_qtd = (v) => parseFloat(v || 0).toFixed(3).replace('.', ',');

onMounted(carregar_insumos);
</script>

<style scoped>
.box_adicionar { background: var(--bg-page); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--border-color); position: relative; }
.linha_add { display: flex; gap: 15px; align-items: flex-end; }
.display_valor { padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: #10b981; border-radius: 6px; font-weight: bold; min-width: 100px; }
.botao_add { background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; height: 42px; font-weight: bold; transition: opacity 0.2s; }
.botao_add:disabled { opacity: 0.5; cursor: not-allowed; }

.lista_resultados {
    position: absolute; top: 100%; left: 0; width: 100%;
    background: var(--bg-card); border: 1px solid var(--border-color);
    border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10; max-height: 200px; overflow-y: auto;
}
.item_resultado { padding: 10px; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.item_resultado:hover { background: var(--hover-bg); }
.item_resultado:last-child { border-bottom: none; }

.info_principal { display: flex; justify-content: space-between; width: 100%; align-items: center; }
.item_resultado strong { color: var(--text-primary); }
.item_resultado small { color: var(--text-secondary); font-size: 11px; }

.tag_estoque { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.tag_estoque.ok { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
.tag_estoque.zerado { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

.item_selecionado_info { margin-top: 10px; font-size: 13px; color: var(--primary-color); background: rgba(59, 130, 246, 0.1); padding: 8px; border-radius: 4px; }

.tabela_simples { border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; margin-bottom: 15px; }
.cabecalho_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr; padding: 10px; background: var(--bg-page); font-weight: bold; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
.linha_tabela { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr; padding: 10px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); align-items: center; transition: background 0.1s; }
.linha_tabela:hover { background: var(--hover-bg); }

.texto_nome { font-weight: 500; }
.unidade_badge { font-size: 10px; color: var(--text-secondary); background: var(--bg-page); padding: 2px 4px; border-radius: 4px; border: 1px solid var(--border-color); }

.btn_del { background: none; border: none; cursor: pointer; filter: grayscale(1); transition: filter 0.2s; }
.btn_del:hover { filter: none; }

.resumo_total { text-align: right; font-size: 16px; color: var(--text-primary); padding: 10px; background: var(--bg-card); border-top: 2px solid var(--border-color); }
.aviso_tabela { padding: 30px; text-align: center; color: var(--text-secondary); font-style: italic; opacity: 0.7; }

.grupo_input label { display: block; margin-bottom: 5px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.input_padrao { width: 100%; padding: 10px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 6px; }
</style>